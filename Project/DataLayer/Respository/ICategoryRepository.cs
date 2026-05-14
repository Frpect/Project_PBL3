using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(int id);
        Task<bool> HasRelatedDataAsync(int id);
        Task SaveChangesAsync();
    }
}
