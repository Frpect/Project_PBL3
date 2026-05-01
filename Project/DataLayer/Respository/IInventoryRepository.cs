using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface IInventoryRepository
    {
        Task<List<Inventory>> GetAllAsync(string? query);
        Task<Inventory?> GetByVariantIdAsync(int variantId);
        Task<List<InventoryTransaction>> GetHistoryAsync();
        Task AddTransactionAsync(InventoryTransaction transaction);
        Task<List<Product>> GetProductsWithVariantsAsync();
        Task SaveChangesAsync();
    }
}
