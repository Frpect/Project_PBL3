using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Respository;
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

        // 🔹 Đặt order — flow chính: lấy cart → check kho → tính tiền → áp discount → tạo order → trừ kho → lưu lịch sử
        public async Task<OrderResponse> PlaceOrderAsync(PlaceOrderRequest request)
        {
            // Lấy cart
            var cart = await _cartRepo.GetByUserIdAsync(request.UserId);

            if (cart == null || !cart.CartItems.Any())
                throw new Exception("Cart is empty");

            // Check tồn kho + tính tổng tiền
            decimal total = 0;
            foreach (var item in cart.CartItems)
            {
                var inventory = await _orderRepo.GetInventoryByVariantIdAsync(item.VariantId ?? 0);

                if (inventory == null || inventory.Quantity < item.Quantity)
                    throw new Exception($"Insufficient stock for variant {item.VariantId}");

                total += (item.Price ?? 0) * (item.Quantity ?? 0);
            }

            // Áp dụng discount nếu có promotion
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
            foreach (var item in cart.CartItems)
            {
                order.OrderDetails.Add(new OrderDetail
                {
                    OrderId = order.OrderId,
                    VariantId = item.VariantId,
                    Quantity = item.Quantity,
                    Price = item.Price
                });

                var inventory = await _orderRepo.GetInventoryByVariantIdAsync(item.VariantId ?? 0);
                inventory!.Quantity -= item.Quantity;
                inventory.LastUpdated = DateTime.Now;

                await _orderRepo.AddTransactionAsync(new InventoryTransaction
                {
                    VariantId = item.VariantId,
                    Quantity = -(item.Quantity ?? 0),
                    Type = "sale",
                    Note = $"Order #{order.OrderId}",
                    CreatedAt = DateTime.Now
                });
            }

            await _orderRepo.SaveChangesAsync();

            return MapToResponse(order);
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

        // 🔹 Hủy đơn hàng (chỉ cho phép khi đang ở trạng thái pending)
        public async Task CancelOrderAsync(int orderId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);

            if (order == null)
                throw new NotFoundException("Order not found");

            if (order.OrderStatus != "pending")
                throw new Exception("Only pending orders can be cancelled");

            order.OrderStatus = "cancelled";
            await _orderRepo.SaveChangesAsync();
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
                Quantity = od.Quantity ?? 0
            }).ToList();

            return new OrderResponse
            {
                OrderId = order.OrderId,
                OrderStatus = order.OrderStatus ?? string.Empty,
                TotalAmount = order.TotalAmount ?? 0,
                DiscountAmount = order.DiscountAmount ?? 0,
                FinalAmount = (order.TotalAmount ?? 0) - (order.DiscountAmount ?? 0),
                OrderDate = order.OrderDate ?? DateTime.Now,
                ShippingAddress = FormatAddress(order.ShippingAddress),
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
