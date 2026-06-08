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
        private readonly IPasswordHasher _passwordHasher;

        public UserService(IUserRepository repo, IJwtService jwtService, IPasswordHasher passwordHasher)
        {
            _repo = repo;
            _jwtService = jwtService;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserResponse> RegisterAsync(RegisterRequest request)
        {
            var userExist = await _repo.GetByIdentifierAsync(request.Username);
            if (userExist != null)
                throw new ConflictException("Tên đăng nhập đã tồn tại");

            var emailExist = await _repo.GetByEmailAsync(request.Email);
            if (emailExist != null)
                throw new ConflictException("Email đã được sử dụng");

            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                var phoneExist = await _repo.GetByPhoneAsync(request.Phone);
                if (phoneExist != null)
                    throw new ConflictException("Số điện thoại đã được sử dụng");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                Email = request.Email,
                Phone = request.Phone,
                FullName = request.FullName,
                CreatedAt = DateTime.Now,
                RoleId = 2  // Customer role for public registration
            };

            await _repo.AddAsync(user);
            await _repo.SaveAsync();

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
            };
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            var user = await _repo.GetByIdentifierAsync(request.Identifier);

            if (user == null)
                throw new NotFoundException("User not found");

            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
                throw new UnauthorizedException("Wrong password");

            var roleName = await _repo.GetRoleNameByIdAsync(user.RoleId) ?? "Customer";
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

        public async Task<UserResponse> GetProfileAsync(int userId)
        {
            var user = await _repo.GetByIdAsync(userId);

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

        public async Task<UserResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _repo.GetByIdAsync(userId);

            if (user == null)
                throw new NotFoundException("User not found");

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;

            await _repo.SaveAsync();

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
            };
        }

        public async Task<List<CustomerResponse>> GetCustomersAsync(string? search)
        {
            var users = await _repo.GetCustomersAsync(search);

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

        public async Task<UserResponse> CreateStaffAsync(CreateStaffRequest request)
        {
            var userExist = await _repo.GetByIdentifierAsync(request.Username);
            if (userExist != null)
                throw new ConflictException("Tên đăng nhập đã tồn tại");

            var emailExist = await _repo.GetByEmailAsync(request.Email);
            if (emailExist != null)
                throw new ConflictException("Email đã được sử dụng");

            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                var phoneExist = await _repo.GetByPhoneAsync(request.Phone);
                if (phoneExist != null)
                    throw new ConflictException("Số điện thoại đã được sử dụng");
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                Email = request.Email,
                Phone = request.Phone,
                FullName = request.FullName,
                CreatedAt = DateTime.Now,
                RoleId = 3,  // Staff role
                Status = "active"
            };

            await _repo.AddAsync(user);
            await _repo.SaveAsync();

            return new UserResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                FullName = user.FullName ?? string.Empty
            };
        }

        public async Task<object> ChangePasswordAsync(ChangePasswordRequest request)
        {
            var user = await _repo.GetByIdAsync(request.UserId);
            if (user == null) throw new NotFoundException("User not found");
            if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
                throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
            await _repo.SaveAsync();
            return new { message = "Đổi mật khẩu thành công" };
        }

        public async Task DeleteAccountAsync(int userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException("User not found");
            user.DeletedAt = DateTime.Now;
            await _repo.SaveAsync();
        }

        public async Task<IEnumerable<AddressResponse>> GetAddressesAsync(int userId)
        {
            var user = await _repo.GetByIdWithAddressesAsync(userId);
            if (user == null) throw new NotFoundException("User not found");

            return user.Addresses.Select(a => new AddressResponse
            {
                AddressId = a.AddressId,
                RecipientName = a.RecipientName,
                Phone = a.Phone,
                Province = a.Province,
                District = a.District,
                Ward = a.Ward,
                StreetAddress = a.StreetAddress,
                AddressType = a.AddressType,
                IsDefault = a.IsDefault ?? false
            });
        }

        public async Task<AddressResponse> CreateAddressAsync(int userId, AddressUpsertRequest request)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException("User not found");

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
                DeletedAt = null
            };

            await _repo.AddAddressAsync(address);
            await _repo.SaveAsync();

            return new AddressResponse
            {
                AddressId = address.AddressId,
                RecipientName = address.RecipientName,
                Phone = address.Phone,
                Province = address.Province,
                District = address.District,
                Ward = address.Ward,
                StreetAddress = address.StreetAddress,
                AddressType = address.AddressType,
                IsDefault = address.IsDefault ?? false
            };
        }

        public async Task DeleteAddressAsync(int userId, int addressId)
        {
            var address = await _repo.GetAddressForUserAsync(addressId, userId);
            if (address == null) throw new NotFoundException("Không tìm thấy địa chỉ");
            _repo.RemoveAddress(address);
            await _repo.SaveAsync();
        }
    }
}
    
