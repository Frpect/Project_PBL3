using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<List<Product>> GetFeaturedAsync(string filter, int take, CancellationToken cancellationToken = default);
        Task<Product?> GetByIdAsync(int id);

        Task AddAsync(Product product);
        void Update(Product product);
        void Delete(Product product);

        Task<bool> CategoryExistsAsync(int categoryId);

        Task<Size> GetOrCreateSizeAsync(string? sizeName);
        Task<Color> GetOrCreateColorAsync(string? colorName);
        Task AddVariantAsync(ProductVariant variant);
        Task AddInventoryAsync(Inventory inventory);

        Task SaveChangesAsync();
    }
}
