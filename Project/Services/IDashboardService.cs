using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(string? period, CancellationToken cancellationToken = default);
    Task<DashboardStatsComparisonDto> GetStatsComparisonAsync(CancellationToken cancellationToken = default);
    Task<List<LowStockProductDto>> GetLowStockAsync(int? threshold, CancellationToken cancellationToken = default);
    Task<List<RevenuePointDto>> GetRevenueAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default);
    Task<List<OrderStatusSliceDto>> GetOrderDistributionAsync(CancellationToken cancellationToken = default);
    Task<List<TopProductDto>> GetTopProductsAsync(int limit, CancellationToken cancellationToken = default);
}
