using Project.DataLayer.Models;

namespace Project.DataLayer.Repository
{
    public interface ICartRepository
    {
        Task<Cart?> GetByUserIdAsync(int userId);
        Task<Cart> GetOrCreateByUserIdAsync(int userId);
        Task<CartItem?> GetCartItemAsync(int cartItemId);
        Task<ProductVariant?> GetVariantAsync(int variantId);
        Task AddItemAsync(CartItem item);
        void RemoveItem(CartItem item);
        Task SaveChangesAsync();
    }
}
