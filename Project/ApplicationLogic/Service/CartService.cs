using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Respository;
using Project.ExceptionHandling;

namespace Project.ApplicationLogic.Service
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepo;

        public CartService(ICartRepository cartRepo)
        {
            _cartRepo = cartRepo;
        }

        // 🔹 Thêm sản phẩm vào cart
        public async Task AddItemAsync(AddToCartRequest request)
        {
            var variant = await _cartRepo.GetVariantAsync(request.VariantId);

            if (variant == null)
                throw new NotFoundException("Product variant not found");

            var stock = variant.Inventories.FirstOrDefault()?.Quantity ?? 0;

            if (stock < request.Quantity)
                throw new Exception($"Insufficient stock. Available: {stock}");

            var cart = await _cartRepo.GetOrCreateByUserIdAsync(request.UserId);

            var existingItem = cart.CartItems
                .FirstOrDefault(ci => ci.VariantId == request.VariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
            }
            else
            {
                var item = new CartItem
                {
                    CartId = cart.CartId,
                    VariantId = request.VariantId,
                    Quantity = request.Quantity,
                    Price = variant.Price ?? 0
                };
                await _cartRepo.AddItemAsync(item);
            }

            await _cartRepo.SaveChangesAsync();
        }

        // 🔹 Xóa item khỏi cart
        public async Task RemoveItemAsync(int cartItemId)
        {
            var item = await _cartRepo.GetCartItemAsync(cartItemId);

            if (item == null)
                throw new NotFoundException("Cart item not found");

            _cartRepo.RemoveItem(item);
            await _cartRepo.SaveChangesAsync();
        }

        // 🔹 Cập nhật số lượng item trong cart
        public async Task UpdateItemAsync(int cartItemId, UpdateCartItemRequest request)
        {
            var item = await _cartRepo.GetCartItemAsync(cartItemId);

            if (item == null)
                throw new NotFoundException("Cart item not found");

            item.Quantity = request.Quantity;
            await _cartRepo.SaveChangesAsync();
        }

        // 🔹 Lấy cart + tính total
        public async Task<CartResponse> GetCartAsync(int userId)
        {
            var cart = await _cartRepo.GetByUserIdAsync(userId);

            if (cart == null)
                return new CartResponse { CartId = 0, Items = new List<CartItemResponse>(), Total = 0 };

            var items = cart.CartItems.Select(ci => new CartItemResponse
            {
                CartItemId = ci.CartItemId,
                VariantId = ci.VariantId ?? 0,
                ProductName = ci.Variant?.Product?.ProductName ?? string.Empty,
                Size = ci.Variant?.Size?.SizeName ?? string.Empty,
                Color = ci.Variant?.Color?.ColorName ?? string.Empty,
                Price = ci.Price ?? 0,
                Quantity = ci.Quantity ?? 0
            }).ToList();

            return new CartResponse
            {
                CartId = cart.CartId,
                Items = items,
                Total = items.Sum(i => i.Price * i.Quantity)
            };
        }

        public async Task<CartResponse> SyncCartAsync(CartSyncRequest request)
        {
            foreach (var line in request.Items.Where(i => i.Quantity > 0))
            {
                await AddItemAsync(new AddToCartRequest
                {
                    UserId = request.UserId,
                    VariantId = line.VariantId,
                    Quantity = line.Quantity
                });
            }

            return await GetCartAsync(request.UserId);
        }
    }
}
