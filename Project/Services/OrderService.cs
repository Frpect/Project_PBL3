using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Repository;
using Project.ExceptionHandling;

namespace Project.ApplicationLogic.Service
{
    public class OrderService : IOrderService
    {
        private readonly ICartRepository _cartRepo;
        private readonly IOrderRepository _orderRepo;

        public OrderService(ICartRepository cartRepo, IOrderRepository orderRepo)
        {
            _cartRepo = cartRepo;
            _orderRepo = orderRepo;
        }

        // 🔹 Đặt order — ưu tiên items từ request (client cart), fallback sang server cart
        public async Task<OrderResponse> PlaceOrderAsync(PlaceOrderRequest request)
        {
            using var transaction = await _orderRepo.BeginTransactionAsync();
            try
            {
                // Chuẩn hóa danh sách items
                List<(int variantId, int quantity, decimal price)> orderItems;

                if (request.Items != null && request.Items.Any())
                {
                    orderItems = request.Items
                        .Select(i => (i.VariantId, i.Quantity, i.Price))
                        .ToList();
                }
                else
                {
                    var cart = await _cartRepo.GetByUserIdAsync(request.UserId);
                    if (cart == null || !cart.CartItems.Any())
                        throw new Exception("Cart is empty");
                    orderItems = cart.CartItems
                        .Select(i => (i.VariantId ?? 0, i.Quantity ?? 1, i.Price ?? 0m))
                        .ToList();
                }

                // Check tồn kho + tính tổng tiền
                decimal total = 0;
                foreach (var (variantId, quantity, price) in orderItems)
                {
                    var inventory = await _orderRepo.GetInventoryByVariantIdAsync(variantId);
                    if (inventory == null || inventory.Quantity < quantity)
                        throw new Exception($"Insufficient stock for variant {variantId}");
                    total += price * quantity;
                }

                // Áp dụng discount
                decimal discount = 0;
                if (request.PromotionId.HasValue)
                {
                    var promotion = await _orderRepo.GetPromotionAsync(request.PromotionId.Value);
                    if (promotion != null && promotion.Status == "active")
                    {
                        discount = promotion.DiscountType == "percent"
                            ? total * (promotion.DiscountValue ?? 0) / 100
                            : (promotion.DiscountValue ?? 0);
                    }
                }

                // Tạo order
                var order = new Order
                {
                    UserId = request.UserId,
                    PromotionId = request.PromotionId,
                    TotalAmount = total,
                    DiscountAmount = discount,
                    OrderStatus = "pending",
                    OrderDate = DateTime.Now,
                    ShippingAddressId = request.ShippingAddressId
                };

                await _orderRepo.AddOrderAsync(order);
                await _orderRepo.SaveChangesAsync();

                // Tạo order detail + trừ kho + lưu lịch sử kho
                foreach (var (variantId, quantity, price) in orderItems)
                {
                    order.OrderDetails.Add(new OrderDetail
                    {
                        OrderId = order.OrderId,
                        VariantId = variantId,
                        Quantity = quantity,
                        Price = price
                    });

                    var inventory = await _orderRepo.GetInventoryByVariantIdAsync(variantId);
                    inventory!.Quantity -= quantity;
                    inventory.LastUpdated = DateTime.Now;

                    await _orderRepo.AddTransactionAsync(new InventoryTransaction
                    {
                        VariantId = variantId,
                        Quantity = -quantity,
                        Type = "Export",
                        Note = $"Đặt hàng #{order.OrderId}",
                        CreatedAt = DateTime.Now
                    });
                }

                await _orderRepo.SaveChangesAsync();
                await transaction.CommitAsync();

                return MapToResponse(order);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // 🔹 Lấy order theo id
        public async Task<OrderResponse> GetOrderAsync(int orderId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);

            if (order == null)
                throw new NotFoundException("Order not found");

            return MapToResponse(order);
        }

        // 🔹 Lấy danh sách order theo user
        public async Task<List<OrderResponse>> GetOrdersByUserAsync(int userId)
        {
            var orders = await _orderRepo.GetOrdersByUserIdAsync(userId);
            return orders.Select(MapToResponse).ToList();
        }

        // 🔹 Lấy tất cả đơn hàng (admin)
        public async Task<List<OrderResponse>> GetAllOrdersAsync()
        {
            var orders = await _orderRepo.GetAllOrdersAsync();
            return orders.Select(MapToResponse).ToList();
        }

        // 🔹 Cập nhật trạng thái đơn hàng (admin)
        public async Task UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _orderRepo.GetByIdAsync(orderId)
                ?? throw new NotFoundException("Order not found");

            var validStatuses = new[] { "pending", "confirmed", "shipping", "completed", "cancelled" };
            if (!validStatuses.Contains(status))
                throw new Exception($"Invalid status: {status}");

            // Nếu chuyển sang cancelled, thực hiện hoàn kho
            if (status == "cancelled" && order.OrderStatus != "cancelled")
            {
                await RestoreInventoryAsync(order);
            }

            await _orderRepo.UpdateStatusAsync(orderId, status);
            await _orderRepo.SaveChangesAsync();
        }

        public async Task<List<OrderListItemDto>> GetRecentSummariesAsync(int limit, CancellationToken cancellationToken = default)
        {
            var take = limit <= 0 ? 5 : limit;
            var orders = await _orderRepo.GetRecentOrdersAsync(take, cancellationToken);
            return orders.Select(o => new OrderListItemDto
            {
                OrderId = o.OrderId,
                UserId = o.UserId,
                OrderStatus = o.OrderStatus ?? string.Empty,
                TotalAmount = o.TotalAmount ?? 0,
                DiscountAmount = o.DiscountAmount ?? 0,
                FinalAmount = (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0),
                OrderDate = o.OrderDate ?? DateTime.MinValue
            }).ToList();
        }

        // 🔹 Hủy đơn hàng (chỉ cho phép khi đang ở trạng thái pending)
        public async Task CancelOrderAsync(int orderId, int userId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);

            if (order == null)
                throw new NotFoundException("Order not found");

            if (order.UserId != userId)
                throw new UnauthorizedAccessException("Bạn không có quyền hủy đơn hàng này");

            if (order.OrderStatus != "pending")
                throw new Exception("Only pending orders can be cancelled");

            // Hoàn kho trước khi đổi trạng thái
            await RestoreInventoryAsync(order);

            order.OrderStatus = "cancelled";
            await _orderRepo.SaveChangesAsync();
        }

        private async Task RestoreInventoryAsync(Order order)
        {
            foreach (var detail in order.OrderDetails)
            {
                if (detail.VariantId.HasValue)
                {
                    var inventory = await _orderRepo.GetInventoryByVariantIdAsync(detail.VariantId.Value);
                    if (inventory != null)
                    {
                        inventory.Quantity += detail.Quantity ?? 0;
                        inventory.LastUpdated = DateTime.Now;

                        await _orderRepo.AddTransactionAsync(new InventoryTransaction
                        {
                            VariantId = detail.VariantId.Value,
                            Quantity = detail.Quantity ?? 0,
                            Type = "Import",
                            Note = $"Hoàn kho do hủy đơn #{order.OrderId}",
                            CreatedAt = DateTime.Now
                        });
                    }
                }
            }
        }

        // 🔹 Map Order sang OrderResponse
        private static OrderResponse MapToResponse(Order order)
        {
            var items = order.OrderDetails.Select(od => new OrderItemResponse
            {
                VariantId = od.VariantId ?? 0,
                ProductName = od.Variant?.Product?.ProductName ?? string.Empty,
                Size = od.Variant?.Size?.SizeName ?? string.Empty,
                Color = od.Variant?.Color?.ColorName ?? string.Empty,
                Price = od.Price ?? 0,
                Quantity = od.Quantity ?? 0,
                Image = od.Variant?.Product?.ProductImages?.FirstOrDefault(pi => pi.IsPrimary == true)?.ImageUrl 
                        ?? od.Variant?.Product?.ProductImages?.FirstOrDefault()?.ImageUrl 
                        ?? string.Empty
            }).ToList();

            var status = order.OrderStatus ?? "pending";
            var total = order.TotalAmount ?? 0;
            var discount = order.DiscountAmount ?? 0;
            var orderDate = order.OrderDate ?? DateTime.Now;
            
            // Lấy thông tin người nhận từ ShippingAddress nếu có, fallback sang User
            var customerName = order.ShippingAddress?.RecipientName 
                               ?? order.User?.FullName 
                               ?? order.User?.Username 
                               ?? string.Empty;
            var customerPhone = order.ShippingAddress?.Phone 
                                ?? order.User?.Phone 
                                ?? string.Empty;

            return new OrderResponse
            {
                OrderId = order.OrderId,
                OrderNumber = $"ORD{order.OrderId:D6}",
                OrderStatus = status,
                Status = status,
                TotalAmount = total,
                Total = total,
                DiscountAmount = discount,
                Discount = discount,
                FinalAmount = total - discount,
                ShippingFee = 30000,
                OrderDate = orderDate,
                CreatedAt = orderDate,
                ShippingAddress = FormatAddress(order.ShippingAddress),
                CustomerName = customerName,
                CustomerPhone = customerPhone,
                CustomerId = order.UserId,
                PaymentStatus = "pending",
                Items = items
            };
        }
        private static string FormatAddress(Address? addr)
        {
            if (addr == null) return string.Empty;
            var parts = new[] { addr.StreetAddress, addr.Ward, addr.District, addr.Province }
                .Where(p => !string.IsNullOrWhiteSpace(p));
            return string.Join(", ", parts);
        }
    }
}
