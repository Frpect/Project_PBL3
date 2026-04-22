using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync();
    }
}
