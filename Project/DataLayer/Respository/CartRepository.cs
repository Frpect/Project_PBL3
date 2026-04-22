using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _context;

        public CartRepository(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Lấy cart theo user (kèm items + variant + product)
        public async Task<Cart?> GetByUserIdAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Variant)
                        .ThenInclude(v => v!.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        // 🔹 Lấy cart hoặc tạo mới nếu user chưa có cart
        public async Task<Cart> GetOrCreateByUserIdAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Variant)
                        .ThenInclude(v => v!.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                await _context.Carts.AddAsync(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        // 🔹 Lấy cart item theo id
        public async Task<CartItem?> GetCartItemAsync(int cartItemId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId);
        }

        // 🔹 Lấy variant (kèm inventory để check tồn kho)
        public async Task<ProductVariant?> GetVariantAsync(int variantId)
        {
            return await _context.ProductVariants
                .Include(v => v.Inventories)
                .FirstOrDefaultAsync(v => v.VariantId == variantId);
        }

        // 🔹 Thêm item vào cart
        public async Task AddItemAsync(CartItem item)
        {
            await _context.CartItems.AddAsync(item);
        }

        // 🔹 Xóa item khỏi cart
        public void RemoveItem(CartItem item)
        {
            _context.CartItems.Remove(item);
        }

        // 🔹 Lưu thay đổi
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
