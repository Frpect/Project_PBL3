using Microsoft.EntityFrameworkCore;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Context;

namespace Project.DataLayer.Repository;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _db;

    public DashboardRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(
        DateTime periodStart, 
        DateTime periodEnd, 
        DateTime prevPeriodStart, 
        DateTime prevPeriodEnd, 
        CancellationToken cancellationToken = default)
    {
        var totalCustomers = await _db.Users
            .CountAsync(u => u.DeletedAt == null && u.RoleId == 2, cancellationToken);
            
        var totalProducts = await _db.Products
            .CountAsync(p => p.DeletedAt == null, cancellationToken);

        // Fetch only necessary data from DB for current period
        var currentStats = await _db.Orders
            .Where(o => o.OrderDate >= periodStart && o.OrderDate < periodEnd && o.OrderStatus != "cancelled")
            .Select(o => new { o.TotalAmount, o.DiscountAmount })
            .ToListAsync(cancellationToken);

        var currentRevenue = currentStats.Sum(o => (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0));
        var currentOrdersCount = currentStats.Count;

        // Fetch only necessary data from DB for previous period
        var previousStats = await _db.Orders
            .Where(o => o.OrderDate >= prevPeriodStart && o.OrderDate < prevPeriodEnd && o.OrderStatus != "cancelled")
            .Select(o => new { o.TotalAmount, o.DiscountAmount })
            .ToListAsync(cancellationToken);

        var previousRevenue = previousStats.Sum(o => (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0));
        var previousOrdersCount = previousStats.Count;

        // Calculate growth
        var revenueGrowth = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        var orderGrowth = previousOrdersCount > 0
            ? ((currentOrdersCount - previousOrdersCount) / (decimal)previousOrdersCount) * 100
            : 0;

        return new DashboardSummaryDto
        {
            TotalRevenue = currentRevenue,
            TotalOrders = currentOrdersCount,
            TotalCustomers = totalCustomers,
            TotalProducts = totalProducts,
            RevenueGrowth = revenueGrowth,
            OrderGrowth = (int)orderGrowth
        };
    }

    public async Task<DashboardStatsComparisonDto> GetStatsComparisonAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        var daysSinceMonday = ((int)today.DayOfWeek + 6) % 7;
        var startThisWeek = today.AddDays(-daysSinceMonday);
        var endThisWeek = startThisWeek.AddDays(7);
        var startLastWeek = startThisWeek.AddDays(-7);

        var thisWeekStats = await _db.Orders
            .Where(o => o.OrderDate >= startThisWeek && o.OrderDate < endThisWeek && o.OrderStatus != "cancelled")
            .Select(o => new { o.TotalAmount, o.DiscountAmount })
            .ToListAsync(cancellationToken);

        var lastWeekStats = await _db.Orders
            .Where(o => o.OrderDate >= startLastWeek && o.OrderDate < startThisWeek && o.OrderStatus != "cancelled")
            .Select(o => new { o.TotalAmount, o.DiscountAmount })
            .ToListAsync(cancellationToken);

        return new DashboardStatsComparisonDto
        {
            ThisWeekRevenue = thisWeekStats.Sum(o => (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0)),
            ThisWeekOrders = thisWeekStats.Count,
            LastWeekRevenue = lastWeekStats.Sum(o => (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0)),
            LastWeekOrders = lastWeekStats.Count
        };
    }

    public async Task<List<LowStockProductDto>> GetLowStockAsync(int threshold, CancellationToken cancellationToken = default)
    {
        return await _db.Inventories
            .AsNoTracking()
            .Include(i => i.Variant)
                .ThenInclude(v => v!.Product)
            .Where(i => i.Quantity <= threshold && i.Variant != null && i.Variant.DeletedAt == null && i.Variant.Product != null && i.Variant.Product.DeletedAt == null)
            .OrderBy(i => i.Quantity)
            .Select(i => new LowStockProductDto
            {
                VariantId = i.VariantId ?? 0,
                ProductId = i.Variant!.ProductId ?? 0,
                ProductName = i.Variant.Product!.ProductName ?? string.Empty,
                Sku = i.Variant.Sku,
                QuantityOnHand = i.Quantity ?? 0
            })
            .Take(100)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<RevenuePointDto>> GetRevenueSeriesAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        var end = to.Date.AddDays(1);
        var start = from.Date;

        var orders = await _db.Orders
            .AsNoTracking()
            .Where(o => o.OrderDate != null && o.OrderDate >= start && o.OrderDate < end && o.OrderStatus != "cancelled")
            .Select(o => new { o.OrderDate, o.TotalAmount, o.DiscountAmount })
            .ToListAsync(cancellationToken);

        return orders
            .GroupBy(o => o.OrderDate!.Value.Date)
            .Select(g => new RevenuePointDto
            {
                Date = g.Key,
                Revenue = g.Sum(x => (x.TotalAmount ?? 0) - (x.DiscountAmount ?? 0)),
                OrderCount = g.Count()
            })
            .OrderBy(x => x.Date)
            .ToList();
    }

    public async Task<List<OrderStatusSliceDto>> GetOrderDistributionAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Orders
            .AsNoTracking()
            .GroupBy(o => o.OrderStatus ?? "unknown")
            .Select(g => new OrderStatusSliceDto
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(int limit, CancellationToken cancellationToken = default)
    {
        return await _db.OrderDetails
            .AsNoTracking()
            .Where(od => od.Variant != null && od.Variant.Product != null && od.Variant.Product.DeletedAt == null)
            .Where(od => od.Order != null && od.Order.OrderStatus != "cancelled")
            .GroupBy(od => new { od.Variant!.ProductId, Name = od.Variant.Product!.ProductName ?? "" })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId ?? 0,
                ProductName = g.Key.Name,
                UnitsSold = g.Sum(x => x.Quantity ?? 0),
                Revenue = g.Sum(x => (x.Price ?? 0) * (x.Quantity ?? 0))
            })
            .OrderByDescending(x => x.UnitsSold)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }
}
