using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/Admin/[controller]")]
    public class StaffsController : ControllerBase
    {
        private readonly IStaffService _service;

        public StaffsController(IStaffService service)
        {
            _service = service;
        }

        // GET /api/Admin/Staffs - Lấy danh sách nhân viên
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

        // GET /api/Admin/Staffs/{id} - Lấy chi tiết nhân viên
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

        // POST /api/Admin/Staffs - Thêm nhân viên mới
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

        // PUT /api/Admin/Staffs/{id} - Cập nhật thông tin nhân viên
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffRequest request)
        {
            try
            {
                var result = await _service.UpdateAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH /api/Admin/Staffs/{id}/toggle-lock - Khóa/Mở khóa
        [HttpPatch("{id}/toggle-lock")]
        public async Task<IActionResult> ToggleLock(int id)
        {
            try
            {
                var result = await _service.ToggleLockAsync(id);
                return Ok(new { 
                    message = $"Staff is now {result.Status}",
                    staff = result 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/Admin/Staffs/{id}/reset-password - Đặt lại mật khẩu
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _service.ResetPasswordAsync(id, request.NewPassword);
                return Ok(new { message = "Password has been reset successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/Admin/Staffs/{id} - Xóa nhân viên
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Staff deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
