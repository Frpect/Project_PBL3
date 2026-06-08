using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IUserService
{
    Task<UserResponse> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<UserResponse> GetProfileAsync(int userId);
    Task<UserResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<List<CustomerResponse>> GetCustomersAsync(string? search);
    Task<UserResponse> CreateStaffAsync(CreateStaffRequest request);
    Task<object> ChangePasswordAsync(ChangePasswordRequest request);
    Task DeleteAccountAsync(int userId);
    Task<IEnumerable<AddressResponse>> GetAddressesAsync(int userId);
    Task<AddressResponse> CreateAddressAsync(int userId, AddressUpsertRequest request);
    Task DeleteAddressAsync(int userId, int addressId);
}
}
