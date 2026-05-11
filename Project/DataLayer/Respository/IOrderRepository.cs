using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface IOrderRepository
    {
        Task AddOrderAsync(Order order);
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetOrdersByUserIdAsync(int userId);
        Task<List<Order>> GetRecentOrdersAsync(int take, CancellationToken cancellationToken = default);
        Task<Inventory?> GetInventoryByVariantIdAsync(int variantId);
        Task<Promotion?> GetPromotionAsync(int promotionId);
        Task AddTransactionAsync(InventoryTransaction transaction);
        Task SaveChangesAsync();
    }
}
