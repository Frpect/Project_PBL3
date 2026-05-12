using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [AllowAnonymous]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _service;

        public StaffController(IStaffService service)
        {
            _service = service;
        }

        // GET /api/admin/staff
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/admin/staff/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
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

        // POST /api/admin/staff
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStaffRequest request)
        {
            try
            {
                var result = await _service.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/admin/staff/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffRequest request)
        {
            try
            {
                var result = await _service.UpdateAsync(id, request);
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

        // PATCH /api/admin/staff/{id}/toggle-lock
        [HttpPatch("{id}/toggle-lock")]
        public async Task<IActionResult> ToggleLock(int id)
        {
            try
            {
                var result = await _service.ToggleLockAsync(id);
                return Ok(new { message = $"Staff is now {result.Status}", staff = result });
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

        // POST /api/admin/staff/{id}/reset-password
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _service.ResetPasswordAsync(id, request.NewPassword);
                return Ok(new { message = "Password has been reset successfully" });
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

        // DELETE /api/admin/staff/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Staff deleted successfully" });
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
