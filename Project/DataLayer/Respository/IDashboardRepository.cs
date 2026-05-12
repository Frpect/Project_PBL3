using Project.ApplicationLogic.DTOs;

namespace Project.DataLayer.Respository;

public interface IDashboardRepository
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<DashboardStatsComparisonDto> GetStatsComparisonAsync(CancellationToken cancellationToken = default);
    Task<List<LowStockProductDto>> GetLowStockAsync(int threshold, CancellationToken cancellationToken = default);
    Task<List<RevenuePointDto>> GetRevenueSeriesAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<List<OrderStatusSliceDto>> GetOrderDistributionAsync(CancellationToken cancellationToken = default);
    Task<List<TopProductDto>> GetTopProductsAsync(int limit, CancellationToken cancellationToken = default);
}
