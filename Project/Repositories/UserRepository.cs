using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;
namespace Project.DataLayer.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdentifierAsync(string identifier)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.DeletedAt == null && (u.Username == identifier || u.Email == identifier));
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.DeletedAt == null && u.Email == email);
        }

        public async Task<User?> GetByPhoneAsync(string phone)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.DeletedAt == null && u.Phone == phone);
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.DeletedAt == null && u.UserId == userId);
        }

        public async Task<User?> GetByIdWithAddressesAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Addresses.Where(a => a.DeletedAt == null))
                .FirstOrDefaultAsync(u => u.DeletedAt == null && u.UserId == userId);
        }

        public async Task<User?> GetByIdWithOrdersAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Orders)
                    .ThenInclude(o => o.OrderDetails)
                        .ThenInclude(od => od.Variant)
                            .ThenInclude(v => v!.Product)
                .Include(u => u.Orders)
                    .ThenInclude(o => o.ShippingAddress)
                .FirstOrDefaultAsync(u => u.DeletedAt == null && u.UserId == userId);
        }

        public async Task<List<User>> GetCustomersAsync(string? search)
        {
            var query = _context.Users
                .Where(u => u.DeletedAt == null && u.RoleId == 2)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(u =>
                    (u.FullName != null && u.FullName.Contains(search)) ||
                    u.Username.Contains(search));

            return await query.OrderBy(u => u.FullName).ToListAsync();
        }

        public async Task<string?> GetRoleNameByIdAsync(int roleId)
        {
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleId == roleId);
            return role?.RoleName;
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Address?> GetAddressForUserAsync(int addressId, int userId)
        {
            return await _context.Addresses.FirstOrDefaultAsync(a => a.DeletedAt == null && a.AddressId == addressId && a.UserId == userId);
        }

        public async Task AddAddressAsync(Address address)
        {
            await _context.Addresses.AddAsync(address);
        }

        public void RemoveAddress(Address address)
        {
            address.DeletedAt = DateTime.Now;
        }
    }
}
