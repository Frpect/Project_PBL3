using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class CartController : ControllerBase
    {
        private readonly ICartService _service;

        public CartController(ICartService service)
        {
            _service = service;
        }

        // 🔹 POST: api/cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request)
        {
            try
            {
                await _service.AddItemAsync(request);
                return Ok(new { message = "Item added to cart" });
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

        // POST: api/Cart/sync — đồng bộ giỏ LocalStorage sau đăng nhập
        [HttpPost("sync")]
        public async Task<IActionResult> Sync([FromBody] CartSyncRequest request)
        {
            try
            {
                var result = await _service.SyncCartAsync(request);
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

        // 🔹 GET: api/cart?userId=1
        [HttpGet]
        public async Task<IActionResult> GetCart([FromQuery] int userId)
        {
            try
            {
                var result = await _service.GetCartAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 PUT: api/cart/item/{id}
        [HttpPut("item/{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateCartItemRequest request)
        {
            try
            {
                await _service.UpdateItemAsync(id, request);
                return Ok(new { message = "Cart item updated" });
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

        // 🔹 DELETE: api/cart/item/{id}
        [HttpDelete("item/{id}")]
        public async Task<IActionResult> RemoveItem(int id)
        {
            try
            {
                await _service.RemoveItemAsync(id);
                return Ok(new { message = "Item removed from cart" });
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
    }
}
