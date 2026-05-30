using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;
        private readonly IInventoryService _inventoryService;

        public ProductsController(IProductService service, IInventoryService inventoryService)
        {
            _service = service;
            _inventoryService = inventoryService;
        }

        // 🔹 GET: api/products
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/Products/featured?filter=bestseller|new&take=8
        [AllowAnonymous]
        [HttpGet("featured")]
        public async Task<IActionResult> Featured([FromQuery] string? filter, [FromQuery] int take = 12, CancellationToken cancellationToken = default)
        {
            var result = await _service.GetFeaturedAsync(filter, take, cancellationToken);
            return Ok(result);
        }

        // 🔹 GET: api/products/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // 🔹 POST: api/products
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductRequest request)
        {
            try
            {
                var productId = await _service.CreateAsync(request);
                return Ok(new { productId, message = "Product created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 PUT: api/products/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductRequest request)
        {
            try
            {
                await _service.UpdateAsync(id, request);
                return Ok(new { message = "Product updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 DELETE: api/products/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET /api/products/search-suggestions?query=...&take=6
        [AllowAnonymous]
        [HttpGet("search-suggestions")]
        public async Task<IActionResult> SearchSuggestions([FromQuery] string? query, [FromQuery] int take = 6)
        {
            var all = await _service.GetAllAsync();
            var filtered = string.IsNullOrWhiteSpace(query)
                ? all.Take(take)
                : all.Where(p => p.ProductName.Contains(query, StringComparison.OrdinalIgnoreCase)).Take(take);
            return Ok(filtered);
        }

        // PATCH /api/products/{id}/toggle-status
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                await _service.ToggleStatusAsync(id);
                return Ok(new { message = "Đã cập nhật trạng thái" });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST /api/products/{productId}/image-url
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPost("{productId}/image-url")]
        public async Task<IActionResult> AddImageUrl(int productId, [FromBody] AddImageUrlRequest request)
        {
            try
            {
                var url = await _service.AddImageUrlAsync(productId, request.ImageUrl);
                return Ok(new { imageUrl = url });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/products/minimal
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpGet("minimal")]
        public async Task<IActionResult> GetMinimal()
        {
            try
            {
                var result = await _inventoryService.GetProductsMinimalAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}