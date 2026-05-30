using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Repository;
using Project.ExceptionHandling;

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
                CategoryName = c.CategoryName ?? string.Empty,
                Description = c.Description,
                Slug = c.Slug,
                ParentId = c.ParentId,
                ParentName = c.Parent?.CategoryName,
                IsVisible = c.IsVisible ?? true
            }).ToList();
        }

        // 🔹 Tạo category mới
        public async Task<CategoryResponse> CreateAsync(CategoryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CategoryName))
                throw new Exception("Category name is required");

            var category = new Category
            {
                CategoryName = request.CategoryName,
                Description = request.Description,
                Slug = request.Slug,
                ParentId = request.ParentId,
                IsVisible = request.IsVisible ?? true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _repo.AddAsync(category);
            await _repo.SaveChangesAsync();

            return new CategoryResponse
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName ?? string.Empty,
                Description = category.Description,
                Slug = category.Slug,
                ParentId = category.ParentId,
                IsVisible = category.IsVisible ?? true
            };
        }

        // 🔹 Cập nhật category
        public async Task UpdateAsync(int id, CategoryRequest request)
        {
            var category = await _repo.GetByIdAsync(id)
                ?? throw new NotFoundException("Category not found");

            if (string.IsNullOrWhiteSpace(request.CategoryName))
                throw new Exception("Category name is required");

            category.CategoryName = request.CategoryName;
            category.Description = request.Description;
            category.Slug = request.Slug;
            category.ParentId = request.ParentId;
            category.IsVisible = request.IsVisible ?? category.IsVisible ?? true;
            category.UpdatedAt = DateTime.Now;

            await _repo.UpdateAsync(category);
            await _repo.SaveChangesAsync();
        }

        // 🔹 Xóa category
        public async Task DeleteAsync(int id)
        {
            var category = await _repo.GetByIdAsync(id)
                ?? throw new NotFoundException("Category not found");

            if (await _repo.HasRelatedDataAsync(id))
                throw new Exception("Cannot delete because it is being used.");

            await _repo.DeleteAsync(category.CategoryId);
            await _repo.SaveChangesAsync();
        }
    }
}
