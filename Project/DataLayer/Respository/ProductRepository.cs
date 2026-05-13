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
                .Where(p => p.DeletedAt == null)
                .ToListAsync();
        }

        /// <param name="filter">bestseller | new</param>
        public async Task<List<Product>> GetFeaturedAsync(string filter, int take, CancellationToken cancellationToken = default)
        {
            filter = (filter ?? "new").Trim().ToLowerInvariant();
            var baseQuery = _context.Products
                .AsNoTracking()
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.ProductVariants.Where(v => v.DeletedAt == null))
                .Where(p => p.DeletedAt == null);

            if (filter is "bestseller" or "bestsellers" or "hot")
            {
                var topIds = await _context.OrderDetails
                    .Where(od => od.Variant != null && od.Order != null && od.Order.OrderStatus != "cancelled")
                    .GroupBy(od => od.Variant!.ProductId)
                    .OrderByDescending(g => g.Sum(x => x.Quantity ?? 0))
                    .Select(g => g.Key)
                    .Take(take)
                    .ToListAsync(cancellationToken);

                if (topIds.Count == 0)
                {
                    return await baseQuery
                        .OrderByDescending(p => p.CreatedAt)
                        .Take(take)
                        .ToListAsync(cancellationToken);
                }

                var bestsellers = await baseQuery
                    .Where(p => topIds.Contains(p.ProductId))
                    .ToListAsync(cancellationToken);
                var rank = topIds.Select((id, idx) => (id, idx)).ToDictionary(x => x.id, x => x.idx);
                return bestsellers
                    .OrderBy(p => rank.GetValueOrDefault(p.ProductId, int.MaxValue))
                    .ToList();
            }

            return await baseQuery
                .OrderByDescending(p => p.CreatedAt)
                .Take(take)
                .ToListAsync(cancellationToken);
        }

        // 🔹 Lấy chi tiết product (kèm category + variant + image)
        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductVariants.Where(v => v.DeletedAt == null))
                .Include(p => p.ProductImages)
                .FirstOrDefaultAsync(p => p.ProductId == id && p.DeletedAt == null);
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

        // 🔹 Xóa mềm product
        public void Delete(Product product)
        {
            product.DeletedAt = DateTime.Now;
            _context.Products.Update(product);
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
