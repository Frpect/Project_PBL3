using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.DataLayer.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Lấy danh sách category
        public async Task<List<Category>> GetAllAsync()
        {
            return await _context.Categories
                .Include(c => c.Parent)
                .OrderBy(c => c.ParentId)
                .ThenBy(c => c.CategoryName)
                .ToListAsync();
        }

        // 🔹 Lấy category theo id
        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _context.Categories.FindAsync(id);
        }

        // 🔹 Thêm category
        public async Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
        }

        // 🔹 Cập nhật category
        public Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            return Task.CompletedTask;
        }

        // 🔹 Xóa category theo id
        public async Task DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
                _context.Categories.Remove(category);
        }

        // 🔹 Kiểm tra dữ liệu liên quan
        public async Task<bool> HasRelatedDataAsync(int id)
        {
            if (await _context.Products.AnyAsync(p => p.CategoryId == id))
                return true;

            if (await _context.Categories.AnyAsync(c => c.ParentId == id))
                return true;

            return await _context.Promotions.AnyAsync(p => p.Categories.Any(c => c.CategoryId == id));
        }

        // 🔹 Lưu thay đổi
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
