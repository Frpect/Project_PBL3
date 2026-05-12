using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{

    public interface IUserRepository
    {
        User GetByIdentifier(string identifier);
        User? GetById(int userId);
        List<User> GetCustomers(string? search);
        string? GetRoleNameById(int roleId);
        void Add(User user);
        void Save();
    }
}
