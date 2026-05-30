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

    private static decimal OrderNet(Project.DataLayer.Models.Order o) =>
        (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0);

    public async Task<DashboardSummaryDto> GetSummaryAsync(string? period, CancellationToken cancellationToken = default)
    {
        var allOrders = await _db.Orders
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var totalCustomers = await _db.Users.CountAsync(u => u.DeletedAt == null && u.RoleId == 2, cancellationToken);
        var totalProducts = await _db.Products.CountAsync(p => p.DeletedAt == null, cancellationToken);

        // Calculate revenue and orders based on period
        var today = DateTime.Today;
        DateTime periodStart, periodEnd, prevPeriodStart, prevPeriodEnd;

        switch (period?.ToLower())
        {
            case "day":
                periodStart = new DateTime(today.Year, today.Month, today.Day);
                periodEnd = periodStart.AddDays(1);
                prevPeriodStart = periodStart.AddDays(-1);
                prevPeriodEnd = periodStart;
                break;
            case "week":
                var dayOfWeek = (int)today.DayOfWeek;
                var daysSinceMonday = (dayOfWeek + 6) % 7;
                periodStart = today.AddDays(-daysSinceMonday);
                periodEnd = periodStart.AddDays(7);
                prevPeriodStart = periodStart.AddDays(-7);
                prevPeriodEnd = periodStart;
                break;
            case "year":
                periodStart = new DateTime(today.Year, 1, 1);
                periodEnd = new DateTime(today.Year + 1, 1, 1);
                prevPeriodStart = new DateTime(today.Year - 1, 1, 1);
                prevPeriodEnd = periodStart;
                break;
            case "month":
            default:
                periodStart = new DateTime(today.Year, today.Month, 1);
                periodEnd = periodStart.AddMonths(1);
                prevPeriodStart = periodStart.AddMonths(-1);
                prevPeriodEnd = periodStart;
                break;
        }

        var currentPeriodOrders = allOrders
            .Where(o => o.OrderDate.HasValue && o.OrderDate.Value >= periodStart && o.OrderDate.Value < periodEnd)
            .ToList();

        var previousPeriodOrders = allOrders
            .Where(o => o.OrderDate.HasValue && o.OrderDate.Value >= prevPeriodStart && o.OrderDate.Value < prevPeriodEnd)
            .ToList();

        var currentRevenue = currentPeriodOrders
            .Where(o => !string.Equals(o.OrderStatus, "cancelled", StringComparison.OrdinalIgnoreCase))
            .Sum(OrderNet);

        var currentOrdersCount = currentPeriodOrders
            .Count(o => !string.Equals(o.OrderStatus, "cancelled", StringComparison.OrdinalIgnoreCase));

        var previousRevenue = previousPeriodOrders
            .Where(o => !string.Equals(o.OrderStatus, "cancelled", StringComparison.OrdinalIgnoreCase))
            .Sum(OrderNet);

        var previousOrdersCount = previousPeriodOrders
            .Count(o => !string.Equals(o.OrderStatus, "cancelled", StringComparison.OrdinalIgnoreCase));

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
