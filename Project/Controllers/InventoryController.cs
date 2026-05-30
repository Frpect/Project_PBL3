using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.Service;
using Project.ApplicationLogic.DTOs;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "StaffOrAdmin")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _service;

        public InventoryController(IInventoryService service)
        {
            _service = service;
        }

        // GET /api/Inventory
        // GET /api/Inventory?query={keyword}
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? query)
        {
            try
            {
                var result = await _service.GetAllAsync(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/Inventory/history
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                var result = await _service.GetHistoryAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/Inventory/transaction
        [HttpPost("transaction")]
        public async Task<IActionResult> CreateTransaction([FromBody] InventoryTransactionRequest request)
        {
            try
            {
                var result = await _service.CreateTransactionAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/Inventory/reasons
        [HttpGet("reasons")]
        public IActionResult GetReasons([FromQuery] InventoryTransactionType? type)
        {
            if (type.HasValue)
            {
                var result = _service.GetReasons(type);
                return Ok(result);
            }
            
            var allReasons = _service.GetAllReasonsByType();
            return Ok(allReasons);
        }
    }
}
