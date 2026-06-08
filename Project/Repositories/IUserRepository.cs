using Project.DataLayer.Models;

namespace Project.DataLayer.Repository;

public interface IUserRepository
{
    Task<User?> GetByIdentifierAsync(string identifier);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByPhoneAsync(string phone);
    Task<User?> GetByIdAsync(int userId);
    Task<User?> GetByIdWithAddressesAsync(int userId);
    Task<User?> GetByIdWithOrdersAsync(int userId);
    Task<List<User>> GetCustomersAsync(string? search);
    Task<string?> GetRoleNameByIdAsync(int roleId);
    Task AddAsync(User user);
    Task SaveAsync();
    Task<Address?> GetAddressForUserAsync(int addressId, int userId);
    Task AddAddressAsync(Address address);
    void RemoveAddress(Address address);
}
