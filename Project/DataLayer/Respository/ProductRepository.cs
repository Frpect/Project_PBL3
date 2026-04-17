using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Lấy danh sách product (kèm category)
        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Category)
                .ToListAsync();
        }

        // 🔹 Lấy chi tiết product (kèm category + variant + image)
        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductVariants)
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        // 🔹 Thêm product
        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
        }

        // 🔹 Cập nhật product
        public void Update(Product product)
        {
            _context.Products.Update(product);
        }

        // 🔹 Xóa product
        public void Delete(Product product)
        {
            _context.Products.Remove(product);
        }

        // 🔹 Kiểm tra category tồn tại
        public async Task<bool> CategoryExistsAsync(int categoryId)
        {
            return await _context.Categories
                .AnyAsync(c => c.CategoryId == categoryId);
        }

        // 🔹 Lưu thay đổi xuống DB
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
