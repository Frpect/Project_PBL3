using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _service;

        public OrderController(IOrderService service)
        {
            _service = service;
        }

        // 🔹 GET: api/order/all  (admin — tất cả đơn hàng)
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllOrdersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 PUT: api/order/{id}/status  (admin — cập nhật trạng thái)
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            try
            {
                await _service.UpdateOrderStatusAsync(id, request.Status);
                return Ok(new { message = "Order status updated" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 POST: api/order
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            try
            {
                var result = await _service.PlaceOrderAsync(request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Order?userId=1 — đơn theo khách
        // GET: api/Order?sort=newest&limit=5 — đơn mới nhất (dashboard / admin)
        [HttpGet]
        public async Task<IActionResult> GetOrders(
            [FromQuery] int? userId,
            [FromQuery] string? sort,
            [FromQuery] int? limit,
            CancellationToken cancellationToken)
        {
            try
            {
                if (userId.HasValue)
                {
                    var result = await _service.GetOrdersByUserAsync(userId.Value);
                    return Ok(result);
                }

                if (!string.IsNullOrEmpty(sort) && !string.Equals(sort, "newest", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Only sort=newest is supported when userId is omitted." });

                var take = limit.GetValueOrDefault(5);
                var summaries = await _service.GetRecentSummariesAsync(take, cancellationToken);
                return Ok(summaries);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 GET: api/order/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            try
            {
                var result = await _service.GetOrderAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 PUT: api/order/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                // Thử lấy userId từ NameIdentifier (mặc định của .NET) hoặc sub claim
                var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                
                if (string.IsNullOrEmpty(sub) || !int.TryParse(sub, out var userId))
                {
                    return Unauthorized(new { message = "Không thể xác định danh tính người dùng" });
                }

                await _service.CancelOrderAsync(id, userId);
                return Ok(new { message = "Order cancelled" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
