using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(int id);

        Task AddAsync(Product product);
        void Update(Product product);
        void Delete(Product product);

        Task<bool> CategoryExistsAsync(int categoryId);

        Task SaveChangesAsync();
    }
}
