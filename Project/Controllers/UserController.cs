using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.Service;
using Project.ApplicationLogic.DTOs;
using Project.ExceptionHandling;
using Project.DataLayer.Models;
using Project.DataLayer.Repository;

namespace Project.Presentation_Layer.Controller
{
    [ApiController]
    [Route("user")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _service.RegisterAsync(request);
            return Ok(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _service.LoginAsync(request);
            return Ok(new
            {
                userId = result.UserId,
                username = result.Username,
                email = result.Email,
                fullName = result.FullName,
                phone = result.Phone,
                role = result.Role,
                token = result.Token,
                expiresAt = result.ExpiresAt
            });
        }

        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var result = await _service.GetProfileAsync(id);
            return Ok(result);
        }

        [HttpPut("profile/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
        {
            var result = await _service.UpdateProfileAsync(id, request);
            return Ok(result);
        }

        // DELETE /user/{userId}
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteAccount(int userId)
        {
            await _service.DeleteAccountAsync(userId);
            return Ok(new { message = "Tài khoản đã bị xóa" });
        }

        // POST /user/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var result = await _service.ChangePasswordAsync(request);
            return Ok(result);
        }

        // GET /user/{userId}/addresses
        [HttpGet("{userId}/addresses")]
        public async Task<IActionResult> GetAddresses(int userId)
        {
            var result = await _service.GetAddressesAsync(userId);
            return Ok(result);
        }

        // POST /user/{userId}/addresses
        [HttpPost("{userId}/addresses")]
        public async Task<IActionResult> CreateAddress(int userId, [FromBody] AddressUpsertRequest request)
        {
            var result = await _service.CreateAddressAsync(userId, request);
            return Ok(result);
        }

        // DELETE /user/{userId}/addresses/{addressId}
        [HttpDelete("{userId}/addresses/{addressId}")]
        public async Task<IActionResult> DeleteAddress(int userId, int addressId)
        {
            await _service.DeleteAddressAsync(userId, addressId);
            return Ok(new { message = "Đã xóa địa chỉ" });
        }
    }
}
