using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/Admin/[controller]")]
    public class StaffsController : ControllerBase
    [Route("api/admin/[controller]")]
    [AllowAnonymous]  // Phase 1: Public. Phase 2: Change to [Authorize(Roles = "Admin")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _service;
        private readonly IUserService _service;

        public StaffsController(IStaffService service)
        public StaffController(IUserService service)
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
        // 🔹 POST: api/admin/staffs
        // Admin tạo tài khoản Staff (RoleId = 3)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStaffRequest request)
        public IActionResult Create([FromBody] CreateStaffRequest request)
        {
            try
            {
                var result = await _service.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
                var result = _service.CreateStaff(request);
                return Ok(new
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
                    message = "Staff account created successfully",
                    userId = result.UserId,
                    username = result.Username,
                    email = result.Email,
                    role = "Staff"
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
            catch (ConflictException ex)
            {
                await _service.DeleteAsync(id);
                return Ok(new { message = "Staff deleted successfully" });
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
