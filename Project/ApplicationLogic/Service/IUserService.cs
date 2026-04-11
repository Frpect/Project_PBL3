using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IUserService
    {
        UserResponse Register(RegisterRequest request);
        UserResponse Login(LoginRequest request);
    }
}
