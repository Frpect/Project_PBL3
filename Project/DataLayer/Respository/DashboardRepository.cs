using Microsoft.EntityFrameworkCore;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Context;

namespace Project.DataLayer.Respository;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _db;

    public DashboardRepository(AppDbContext db)
    {
        _db = db;
    }

    private static decimal OrderNet(Project.DataLayer.Models.Order o) =>
        (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0);

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        var monthStart = new DateTime(today.Year, today.Month, 1);

        var ordersToday = await _db.Orders
            .Where(o => o.OrderDate >= today && o.OrderDate < today.AddDays(1))
            .ToListAsync(cancellationToken);

        var ordersMonth = await _db.Orders
            .Where(o => o.OrderDate >= monthStart && o.OrderDate < monthStart.AddMonths(1))
            .ToListAsync(cancellationToken);

        var totalCustomers = await _db.Users.CountAsync(u => u.DeletedAt == null && u.RoleId == 1, cancellationToken);
        var totalProducts = await _db.Products.CountAsync(p => p.DeletedAt == null, cancellationToken);

        return new DashboardSummaryDto
        {
            TodayRevenue = ordersToday.Where(o => o.OrderStatus != "cancelled").Sum(OrderNet),
            TodayOrders = ordersToday.Count(o => o.OrderStatus != "cancelled"),
            MonthRevenue = ordersMonth.Where(o => o.OrderStatus != "cancelled").Sum(OrderNet),
            MonthOrders = ordersMonth.Count(o => o.OrderStatus != "cancelled"),
            TotalCustomers = totalCustomers,
            TotalProducts = totalProducts
        };
    }

    public async Task<DashboardStatsComparisonDto> GetStatsComparisonAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        var daysSinceMonday = ((int)today.DayOfWeek + 6) % 7;
        var startThisWeek = today.AddDays(-daysSinceMonday);
        var endThisWeek = startThisWeek.AddDays(7);
        var startLastWeek = startThisWeek.AddDays(-7);

        var thisWeek = await _db.Orders
            .Where(o => o.OrderDate >= startThisWeek && o.OrderDate < endThisWeek)
            .ToListAsync(cancellationToken);

        var lastWeek = await _db.Orders
            .Where(o => o.OrderDate >= startLastWeek && o.OrderDate < startThisWeek)
            .ToListAsync(cancellationToken);

        return new DashboardStatsComparisonDto
        {
            ThisWeekRevenue = thisWeek.Where(o => o.OrderStatus != "cancelled").Sum(OrderNet),
            ThisWeekOrders = thisWeek.Count(o => o.OrderStatus != "cancelled"),
            LastWeekRevenue = lastWeek.Where(o => o.OrderStatus != "cancelled").Sum(OrderNet),
            LastWeekOrders = lastWeek.Count(o => o.OrderStatus != "cancelled")
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
