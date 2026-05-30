using Project.DataLayer.Models;

namespace Project.DataLayer.Repository;

public interface IUserRepository
    {
        User GetByIdentifier(string identifier);
        User? GetByEmail(string email);
        User? GetByPhone(string phone);
        User? GetById(int userId);
        User? GetByIdWithAddresses(int userId);
        User? GetByIdWithOrders(int userId);
        List<User> GetCustomers(string? search);
        string? GetRoleNameById(int roleId);
        void Add(User user);
        void Save();
        Address? GetAddressForUser(int addressId, int userId);
        void AddAddress(Address address);
        void RemoveAddress(Address address);
    }
