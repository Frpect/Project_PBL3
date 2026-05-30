using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface ICartService
    {
        Task AddItemAsync(AddToCartRequest request);
        Task RemoveItemAsync(int cartItemId);
        Task UpdateItemAsync(int cartItemId, UpdateCartItemRequest request);
        Task<CartResponse> GetCartAsync(int userId);
        Task<CartResponse> SyncCartAsync(CartSyncRequest request);
    }
}
