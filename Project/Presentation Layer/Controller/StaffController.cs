using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [AllowAnonymous]  // Phase 1: Public. Phase 2: Change to [Authorize(Roles = "Admin")]
    public class StaffController : ControllerBase
    {
        private readonly IUserService _service;

        public StaffController(IUserService service)
        {
            _service = service;
        }

        // 🔹 POST: api/admin/staffs
        // Admin tạo tài khoản Staff (RoleId = 3)
        [HttpPost]
        public IActionResult Create([FromBody] CreateStaffRequest request)
        {
            try
            {
                var result = _service.CreateStaff(request);
                return Ok(new
                {
                    message = "Staff account created successfully",
                    userId = result.UserId,
                    username = result.Username,
                    email = result.Email,
                    role = "Staff"
                });
            }
            catch (ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
