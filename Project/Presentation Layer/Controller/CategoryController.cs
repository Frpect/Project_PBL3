using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        // 🔹 GET: api/category
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // 🔹 POST: api/category
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryRequest request)
        {
            try
            {
                var result = await _service.CreateAsync(request);
                return CreatedAtAction(nameof(GetAll), result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 🔹 PUT: api/category/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryRequest request)
        {
            try
            {
                await _service.UpdateAsync(id, request);
                var categories = await _service.GetAllAsync();
                var updated = categories.FirstOrDefault(c => c.CategoryId == id);
                return Ok(updated);
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

        // 🔹 DELETE: api/category/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Category deleted successfully" });
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
