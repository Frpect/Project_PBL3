using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;
namespace Project.DataLayer.Respository
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
       
        public User GetByIdentifier(string identifier)
        {
            return _context.Users
                .FirstOrDefault(u => u.DeletedAt == null && (u.Username == identifier || u.Email == identifier));
        }

        public User? GetById(int userId)
        {
            return _context.Users.FirstOrDefault(u => u.DeletedAt == null && u.UserId == userId);
        }

        public User? GetByIdWithAddresses(int userId)
        {
            return _context.Users
                .Include(u => u.Addresses)
                .FirstOrDefault(u => u.DeletedAt == null && u.UserId == userId);
        }

        public User? GetByIdWithOrders(int userId)
        {
            return _context.Users
                .Include(u => u.Orders)
                    .ThenInclude(o => o.OrderDetails)
                        .ThenInclude(od => od.Variant)
                            .ThenInclude(v => v.Product)
                .Include(u => u.Orders)
                    .ThenInclude(o => o.ShippingAddress)
                .FirstOrDefault(u => u.DeletedAt == null && u.UserId == userId);
        }

        public List<User> GetCustomers(string? search)
        {
            var query = _context.Users
                .Where(u => u.DeletedAt == null)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(u =>
                    (u.FullName != null && u.FullName.Contains(search)) ||
                    u.Username.Contains(search));

            return query.OrderBy(u => u.FullName).ToList();
        }

        public string? GetRoleNameById(int roleId)
        {
            return _context.Roles
                .FirstOrDefault(r => r.RoleId == roleId)
                ?.RoleName;
        }

        public void Add(User user)
        {
            _context.Users.Add(user);
        }

        public void Save()
        {
            _context.SaveChanges();
        }

        public Address? GetAddressForUser(int addressId, int userId)
        {
            return _context.Addresses.FirstOrDefault(a => a.AddressId == addressId && a.UserId == userId);
        }

        public void AddAddress(Address address)
        {
            _context.Addresses.Add(address);
        }

        public void RemoveAddress(Address address)
        {
            _context.Addresses.Remove(address);
        }
    }
}
