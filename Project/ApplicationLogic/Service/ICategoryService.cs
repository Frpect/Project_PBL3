using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface ICategoryService
    {
        Task<List<CategoryResponse>> GetAllAsync();
    }
}
