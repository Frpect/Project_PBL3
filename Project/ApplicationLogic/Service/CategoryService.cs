using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Respository;

namespace Project.ApplicationLogic.Service
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;

        public CategoryService(ICategoryRepository repo)
        {
            _repo = repo;
        }

        // 🔹 Lấy danh sách category
        public async Task<List<CategoryResponse>> GetAllAsync()
        {
            var categories = await _repo.GetAllAsync();

            return categories.Select(c => new CategoryResponse
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName ?? string.Empty
            }).ToList();
        }
    }
}
