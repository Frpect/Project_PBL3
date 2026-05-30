using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.Service;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "StaffOrAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService service)
        {
            _service = service;
        }

        // GET /api/dashboard/summary
        [HttpGet("summary")]
        public async Task<IActionResult> Summary([FromQuery] string? period, CancellationToken cancellationToken)
        {
            var dto = await _service.GetSummaryAsync(period, cancellationToken);
            return Ok(dto);
        }

        // GET /api/dashboard/stats-comparison
        [HttpGet("stats-comparison")]
        public async Task<IActionResult> StatsComparison(CancellationToken cancellationToken)
        {
            var dto = await _service.GetStatsComparisonAsync(cancellationToken);
            return Ok(dto);
        }

        // GET /api/dashboard/top-products?limit=5
        [HttpGet("top-products")]
        public async Task<IActionResult> TopProducts([FromQuery] int limit = 5, CancellationToken cancellationToken = default)
        {
            var result = await _service.GetTopProductsAsync(limit, cancellationToken);
            return Ok(result);
        }

        // GET /api/dashboard/low-stock-alert?threshold=10
        [HttpGet("low-stock-alert")]
        public async Task<IActionResult> LowStock([FromQuery] int threshold = 10, CancellationToken cancellationToken = default)
        {
            var result = await _service.GetLowStockAsync(threshold, cancellationToken);
            return Ok(result);
        }

        // GET /api/dashboard/revenue?from=2024-01-01&to=2024-12-31
        [HttpGet("revenue")]
        public async Task<IActionResult> Revenue([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken = default)
        {
            var result = await _service.GetRevenueAsync(from, to, cancellationToken);
            return Ok(result);
        }

        // GET /api/dashboard/order-distribution
        [HttpGet("order-distribution")]
        public async Task<IActionResult> OrderDistribution(CancellationToken cancellationToken = default)
        {
            var result = await _service.GetOrderDistributionAsync(cancellationToken);
            return Ok(result);
        }
    }
}
