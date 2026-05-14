using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Context;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "StaffOrAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/dashboard/summary
        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalCustomers = await _context.Users.CountAsync();
            var totalProducts = await _context.Products.CountAsync(p => p.DeletedAt == null);
            var totalRevenue = await _context.Orders.SumAsync(o => (decimal?)(o.TotalAmount ?? 0)) ?? 0m;

            var dto = new DashboardSummaryResponse
            {
                TotalOrders = totalOrders,
                TotalCustomers = totalCustomers,
                TotalProducts = totalProducts,
                TotalRevenue = totalRevenue
            };

            return Ok(dto);
        }

        // GET /api/dashboard/top-products?limit=5
        [HttpGet("top-products")]
        public async Task<IActionResult> TopProducts([FromQuery] int limit = 5)
        {
            var top = await _context.OrderDetails
                .Include(od => od.Variant)
                    .ThenInclude(v => v.Product)
                .GroupBy(od => od.Variant!.Product!.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    ProductName = g.FirstOrDefault()!.Variant!.Product!.ProductName,
                    Quantity = g.Sum(x => x.Quantity ?? 0)
                })
                .OrderByDescending(x => x.Quantity)
                .Take(limit)
                .ToListAsync();

            var result = top.Select(t => new TopProductResponse
            {
                ProductId = t.ProductId,
                ProductName = t.ProductName ?? string.Empty,
                QuantitySold = t.Quantity
            }).ToList();

            return Ok(result);
        }

        // GET /api/dashboard/low-stock-alert
        [HttpGet("low-stock-alert")]
        public async Task<IActionResult> LowStock([FromQuery] int threshold = 5)
        {
            var list = await _context.ProductVariants
                .Include(v => v.Inventories)
                .Include(v => v.Product)
                .Select(v => new
                {
                    VariantId = v.VariantId,
                    ProductName = v.Product!.ProductName,
                    Stock = v.Inventories.Sum(i => i.Quantity) ?? 0
                })
                .Where(x => x.Stock <= threshold)
                .ToListAsync();

            var result = list.Select(x => new LowStockResponse
            {
                VariantId = x.VariantId,
                ProductName = x.ProductName ?? string.Empty,
                StockQuantity = x.Stock
            }).ToList();

            return Ok(result);
        }
    }
}
