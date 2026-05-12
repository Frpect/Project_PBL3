using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Respository;

namespace Project.ApplicationLogic.Service;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repo;

    public DashboardService(IDashboardRepository repo)
    {
        _repo = repo;
    }

    public Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default) =>
        _repo.GetSummaryAsync(cancellationToken);

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
