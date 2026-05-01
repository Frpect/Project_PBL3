using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
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
                .Where(c => c.DeletedAt == null)
                .ToListAsync();
        }
    }
}
