namespace Project.ApplicationLogic.Service
{
    using System;
    using System.Security.Cryptography;
    using System.Text;
    using Project.ApplicationLogic.DTOs;
    using Project.ExceptionHandling;
    using Project.DataLayer.Models;
    using Project.DataLayer.Respository;
    
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public UserResponse Register(RegisterRequest request)
        {
            var userExist = _repo.GetByIdentifier(request.Username);

            if (userExist != null)
                throw new ConflictException("Username already exists");

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Email = request.Email,
                Phone = request.Phone,
                FullName = request.FullName,
                CreatedAt = DateTime.Now,
                RoleId = 1
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

        public UserResponse Login(LoginRequest request)
        {
            var user = _repo.GetByIdentifier(request.Identifier);

            if (user == null)
                throw new NotFoundException("User not found");

            if (user.PasswordHash != HashPassword(request.Password))
                throw new UnauthorizedException("Wrong password");

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
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

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
    
