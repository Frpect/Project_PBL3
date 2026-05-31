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
        private readonly IUserRepository _userRepo;

        public UserController(IUserService service, IUserRepository userRepo)
        {
            _service = service;
            _userRepo = userRepo;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public IActionResult Register(RegisterRequest request)
        {
            try
            {
                var result = _service.Register(request);
                return Ok(result);
            }
            catch (ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login(LoginRequest request)
        {
            try
            {
                var result = _service.Login(request);
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
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
        [HttpGet("profile/{id}")]
        public IActionResult GetProfile(int id)
        {
            try
            {
                var result = _service.GetProfile(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("profile/{id}")]
        public IActionResult UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
        {
            try
            {
                var result = _service.UpdateProfile(id, request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE /user/{userId}
        [HttpDelete("{userId}")]
        public IActionResult DeleteAccount(int userId)
        {
            var user = _userRepo.GetById(userId);
            if (user == null) return NotFound(new { message = "User not found" });
            user.DeletedAt = DateTime.Now;
            _userRepo.Save();
            return Ok(new { message = "Tài khoản đã bị xóa" });
        }

        // POST /user/change-password
        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var result = _service.ChangePassword(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /user/{userId}/addresses
        [HttpGet("{userId}/addresses")]
        public IActionResult GetAddresses(int userId)
        {
            var user = _userRepo.GetByIdWithAddresses(userId);
            if (user == null) return NotFound(new { message = "User not found" });
            var result = user.Addresses.Select(a => new
            {
                addressId = a.AddressId,
                recipientName = a.RecipientName,
                phone = a.Phone,
                province = a.Province,
                district = a.District,
                ward = a.Ward,
                streetAddress = a.StreetAddress,
                addressType = a.AddressType,
                isDefault = a.IsDefault ?? false
            });
            return Ok(result);
        }

        // POST /user/{userId}/addresses
        [HttpPost("{userId}/addresses")]
        public IActionResult CreateAddress(int userId, [FromBody] AddressUpsertRequest request)
        {
            try
            {
                var user = _userRepo.GetById(userId);
                if (user == null) return NotFound(new { message = "User not found" });

                var address = new Address
                {
                    UserId = userId,
                    RecipientName = request.RecipientName,
                    Phone = request.Phone,
                    Province = request.Province,
                    District = request.District,
                    Ward = request.Ward,
                    StreetAddress = request.StreetAddress,
                    AddressType = request.AddressType,
                    IsDefault = request.IsDefault,
                    DeletedAt = null // Đảm bảo DeletedAt là null khi tạo mới
                };

                _userRepo.AddAddress(address);
                _userRepo.Save();

                return Ok(new
                {
                    addressId = address.AddressId,
                    recipientName = address.RecipientName,
                    phone = address.Phone,
                    province = address.Province,
                    district = address.District,
                    ward = address.Ward,
                    streetAddress = address.StreetAddress,
                    addressType = address.AddressType,
                    isDefault = address.IsDefault
                });
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết ra console để debug nếu cần
                Console.WriteLine($"Error creating address: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                
                return BadRequest(new { message = "Thêm địa chỉ thất bại: " + ex.Message });
            }
        }

        // DELETE /user/{userId}/addresses/{addressId}
        [HttpDelete("{userId}/addresses/{addressId}")]
        public IActionResult DeleteAddress(int userId, int addressId)
        {
            try
            {
                var address = _userRepo.GetAddressForUser(addressId, userId);
                if (address == null) return NotFound(new { message = "Không tìm thấy địa chỉ" });
                _userRepo.RemoveAddress(address);
                _userRepo.Save();
                return Ok(new { message = "Đã xóa địa chỉ" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Xóa địa chỉ thất bại: " + ex.Message });
            }
        }
    }
}
