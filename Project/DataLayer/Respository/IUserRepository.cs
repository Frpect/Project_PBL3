using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{

    public interface IUserRepository
    {
        User GetByIdentifier(string identifier);
        User? GetById(int userId);
        User? GetByIdWithAddresses(int userId);
        User? GetByIdWithOrders(int userId);
        List<User> GetCustomers(string? search);
        void Add(User user);
        void Save();
    }
}
