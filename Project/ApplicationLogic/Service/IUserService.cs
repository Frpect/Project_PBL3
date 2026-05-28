using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IUserService
    {
        UserResponse Register(RegisterRequest request);
        LoginResponse Login(LoginRequest request);
        UserResponse GetProfile(int userId);
        UserResponse UpdateProfile(int userId, UpdateProfileRequest request);
        List<CustomerResponse> GetCustomers(string? search);
        UserResponse CreateStaff(CreateStaffRequest request);
        object ChangePassword(ChangePasswordRequest request);
    }
}
