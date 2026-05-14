using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly AppDbContext _context;

        public InventoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Inventory>> GetAllAsync(string? query)
        {
            var q = _context.Inventories
                .Include(i => i.Variant)
                    .ThenInclude(v => v.Product)
                .Include(i => i.Variant)
                    .ThenInclude(v => v.Size)
                .Include(i => i.Variant)
                    .ThenInclude(v => v.Color)
                .Where(i => i.Variant != null && i.Variant.Product != null)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                q = q.Where(i =>
                    (i.Variant != null && i.Variant.Product != null && i.Variant.Product.ProductName != null && i.Variant.Product.ProductName.Contains(query)) ||
                    (i.Variant != null && i.Variant.Sku != null && i.Variant.Sku.Contains(query)));
            }

            return await q.OrderBy(i => i.Variant!.Product!.ProductName).ToListAsync();
        }

        public async Task<Inventory?> GetByVariantIdAsync(int variantId)
        {
            return await _context.Inventories
                .FirstOrDefaultAsync(i => i.VariantId == variantId);
        }

        public async Task<List<InventoryTransaction>> GetHistoryAsync()
        {
            return await _context.InventoryTransactions
                .Include(t => t.Variant)
                    .ThenInclude(v => v.Product)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task AddTransactionAsync(InventoryTransaction transaction)
        {
            await _context.InventoryTransactions.AddAsync(transaction);
        }

        public async Task<List<Product>> GetProductsWithVariantsAsync()
        {
            return await _context.Products
                .Include(p => p.ProductVariants)
                    .ThenInclude(v => v.Size)
                .Include(p => p.ProductVariants)
                    .ThenInclude(v => v.Color)
                .OrderBy(p => p.ProductName)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
