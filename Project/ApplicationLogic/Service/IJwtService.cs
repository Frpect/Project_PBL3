using Project.DataLayer.Models;

namespace Project.ApplicationLogic.Service
{
    public interface IJwtService
    {
        string GenerateToken(User user, string roleName);
    }
}
