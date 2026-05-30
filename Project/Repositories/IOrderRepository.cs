using Project.DataLayer.Models;

namespace Project.DataLayer.Repository
{
    public interface IOrderRepository
    {
        Task AddOrderAsync(Order order);
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetAllOrdersAsync();
        Task<List<Order>> GetOrdersByUserIdAsync(int userId);
        Task<List<Order>> GetRecentOrdersAsync(int take, CancellationToken cancellationToken = default);
        Task UpdateStatusAsync(int orderId, string status);
        Task<Inventory?> GetInventoryByVariantIdAsync(int variantId);
        Task<Promotion?> GetPromotionAsync(int promotionId);
        Task AddTransactionAsync(InventoryTransaction transaction);
        Task SaveChangesAsync();
    }
}
