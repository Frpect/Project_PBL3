using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IUserService
    {
        UserResponse Register(RegisterRequest request);
        UserResponse Login(LoginRequest request);
        UserResponse GetProfile(int userId);
        UserResponse UpdateProfile(int userId, UpdateProfileRequest request);
    }
}
