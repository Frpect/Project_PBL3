namespace Project.ApplicationLogic.Service
{
    using System;
    using System.Security.Cryptography;
    using System.Text;
    using Project.ApplicationLogic.DTOs;
    using Project.ExceptionHandling;
    using Project.DataLayer.Models;
    using Project.DataLayer.Repository;
    
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        private readonly IJwtService _jwtService;

        public UserService(IUserRepository repo, IJwtService jwtService)
        {
            _repo = repo;
            _jwtService = jwtService;
        }

        public UserResponse Register(RegisterRequest request)
        {
            var userExist = _repo.GetByIdentifier(request.Username);
            if (userExist != null)
                throw new ConflictException("Tên đăng nhập đã tồn tại");

            var emailExist = _repo.GetByEmail(request.Email);
            if (emailExist != null)
                throw new ConflictException("Email đã được sử dụng");

            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                var phoneExist = _repo.GetByPhone(request.Phone);
                if (phoneExist != null)
                    throw new ConflictException("Số điện thoại đã được sử dụng");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Email = request.Email,
                Phone = request.Phone,
                FullName = request.FullName,
                CreatedAt = DateTime.Now,
                RoleId = 2  // Customer role for public registration
            };

            _repo.Add(user);
            _repo.Save();

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
            };
        }

        public LoginResponse Login(LoginRequest request)
        {
            var user = _repo.GetByIdentifier(request.Identifier);

            if (user == null)
                throw new NotFoundException("User not found");

            if (user.PasswordHash != HashPassword(request.Password))
                throw new UnauthorizedException("Wrong password");

            var roleName = _repo.GetRoleNameById(user.RoleId) ?? "Customer";
            var token = _jwtService.GenerateToken(user, roleName);
            var expiresAt = DateTime.UtcNow.AddHours(1);

            return new LoginResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName ?? string.Empty,
                Phone = user.Phone ?? string.Empty,
                Role = roleName,
                Token = token,
                ExpiresAt = expiresAt
            };
        }

        public UserResponse GetProfile(int userId)
        {
            var user = _repo.GetById(userId);

            if (user == null)
                throw new NotFoundException("User not found");

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
            };
        }

        public UserResponse UpdateProfile(int userId, UpdateProfileRequest request)
        {
            var user = _repo.GetById(userId);

            if (user == null)
                throw new NotFoundException("User not found");

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;

            _repo.Save();

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
            };
        }

        public List<CustomerResponse> GetCustomers(string? search)
        {
            var users = _repo.GetCustomers(search);

            return users.Select(u => new CustomerResponse
            {
                UserId = u.UserId,
                Username = u.Username,
                FullName = u.FullName ?? string.Empty,
                Email = u.Email,
                Phone = u.Phone ?? string.Empty,
                Status = u.Status ?? string.Empty,
                CreatedAt = u.CreatedAt
            }).ToList();
        }

        // 🔹 Admin tạo tài khoản Staff (RoleId = 3)
        public UserResponse CreateStaff(CreateStaffRequest request)
        {
            var userExist = _repo.GetByIdentifier(request.Username);
            if (userExist != null)
                throw new ConflictException("Tên đăng nhập đã tồn tại");

            var emailExist = _repo.GetByEmail(request.Email);
            if (emailExist != null)
                throw new ConflictException("Email đã được sử dụng");

            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                var phoneExist = _repo.GetByPhone(request.Phone);
                if (phoneExist != null)
                    throw new ConflictException("Số điện thoại đã được sử dụng");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Email = request.Email,
                Phone = request.Phone,
                FullName = request.FullName,
                CreatedAt = DateTime.Now,
                RoleId = 3,  // Staff role
                Status = "active"
            };

            _repo.Add(user);
            _repo.Save();

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
            };
        }

        public object ChangePassword(ChangePasswordRequest request)
        {
            var user = _repo.GetById(request.UserId);
            if (user == null) throw new NotFoundException("User not found");
            if (user.PasswordHash != HashPassword(request.CurrentPassword))
                throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
            user.PasswordHash = HashPassword(request.NewPassword);
            _repo.Save();
            return new { message = "Đổi mật khẩu thành công" };
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
    
