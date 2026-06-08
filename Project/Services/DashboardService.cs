using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Repository;

namespace Project.ApplicationLogic.Service;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repo;

    public DashboardService(IDashboardRepository repo)
    {
        _repo = repo;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(string? period, CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        DateTime periodStart, periodEnd, prevPeriodStart, prevPeriodEnd;

        switch (period?.ToLower())
        {
            case "day":
                periodStart = today;
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
                periodEnd = periodStart.AddYears(1);
                prevPeriodStart = periodStart.AddYears(-1);
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

        return await _repo.GetSummaryAsync(periodStart, periodEnd, prevPeriodStart, prevPeriodEnd, cancellationToken);
    }

    public Task<DashboardStatsComparisonDto> GetStatsComparisonAsync(CancellationToken cancellationToken = default) =>
        _repo.GetStatsComparisonAsync(cancellationToken);

    public Task<List<LowStockProductDto>> GetLowStockAsync(int? threshold, CancellationToken cancellationToken = default) =>
        _repo.GetLowStockAsync(threshold ?? 10, cancellationToken);

    public Task<List<OrderStatusSliceDto>> GetOrderDistributionAsync(CancellationToken cancellationToken = default) =>
        _repo.GetOrderDistributionAsync(cancellationToken);

    public Task<List<TopProductDto>> GetTopProductsAsync(int limit, CancellationToken cancellationToken = default) =>
        _repo.GetTopProductsAsync(limit <= 0 ? 5 : limit, cancellationToken);

    public Task<List<RevenuePointDto>> GetRevenueAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
    {
        var end = to?.Date ?? DateTime.Today;
        var start = from?.Date ?? end.AddDays(-30);
        if (start > end)
            (start, end) = (end, start);
        return _repo.GetRevenueSeriesAsync(start, end, cancellationToken);
    }
}
