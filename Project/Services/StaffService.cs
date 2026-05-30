using System.Security.Cryptography;
using System.Text;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Repository;

namespace Project.ApplicationLogic.Service
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _repo;

        public StaffService(IStaffRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<StaffResponse>> GetAllAsync()
        {
            var staff = await _repo.GetAllStaffAsync();
            return staff.Select(MapToStaffResponse).ToList();
        }

        public async Task<StaffResponse> GetByIdAsync(int id)
        {
            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Staff not found");
            return MapToStaffResponse(user);
        }

        public async Task<StaffResponse> CreateAsync(CreateStaffRequest request)
        {
            // Check if username exists
            var existingUsername = await _repo.GetByUsernameAsync(request.Username);
            if (existingUsername != null)
                throw new Exception("Tên đăng nhập đã tồn tại");

            // Check if email exists
            var existingEmail = await _repo.GetByEmailAsync(request.Email);
            if (existingEmail != null)
                throw new Exception("Email đã được sử dụng");

            // Check if phone exists
            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                var existingPhone = await _repo.GetByPhoneAsync(request.Phone);
                if (existingPhone != null)
                    throw new Exception("Số điện thoại đã được sử dụng");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Email = request.Email,
                FullName = request.FullName,
                Phone = request.Phone,
                RoleId = 3,
                Status = "active",
                CreatedAt = DateTime.Now
            };

            await _repo.AddAsync(user);
            await _repo.SaveChangesAsync();

            // Reload with Role
            var created = await _repo.GetByIdAsync(user.UserId);
            return MapToStaffResponse(created!);
        }

        public async Task<StaffResponse> UpdateAsync(int id, UpdateStaffRequest request)
        {
            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Staff not found");

            // Check if email is being used by another user
            var existingEmail = await _repo.GetByEmailAsync(request.Email);
            if (existingEmail != null && existingEmail.UserId != id)
                throw new Exception("Email already exists");

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;

            _repo.Update(user);
            await _repo.SaveChangesAsync();
            return MapToStaffResponse(user);
        }

        public async Task<StaffResponse> ToggleLockAsync(int id)
        {
            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Staff not found");

            user.Status = user.Status == "active" ? "locked" : "active";
            _repo.Update(user);
            await _repo.SaveChangesAsync();
            return MapToStaffResponse(user);
        }

        public async Task ResetPasswordAsync(int id, string newPassword)
        {
            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Staff not found");

            user.PasswordHash = HashPassword(newPassword);

            _repo.Update(user);
            await _repo.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _repo.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Staff not found");

            _repo.Delete(user);
            await _repo.SaveChangesAsync();
        }

        private static StaffResponse MapToStaffResponse(User u) => new()
        {
            UserId = u.UserId,
            StaffId = u.UserId,
            Username = u.Username,
            FullName = u.FullName ?? string.Empty,
            Email = u.Email,
            Phone = u.Phone,
            Status = u.Status ?? "active",
            CreatedAt = u.CreatedAt,
            Role = u.Role?.RoleName ?? string.Empty
        };

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
