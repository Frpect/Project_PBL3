using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public class StaffRepository : IStaffRepository
    {
        private readonly AppDbContext _context;

        public StaffRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get all staff (RoleId != 1, assuming 1 is customer)
        public async Task<List<User>> GetAllStaffAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .Where(u => u.RoleId != 1 && u.DeletedAt == null)
                .OrderBy(u => u.FullName)
                .ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id && u.DeletedAt == null);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username && u.DeletedAt == null);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.DeletedAt == null);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public void Update(User user)
        {
            _context.Users.Update(user);
        }

        public void Delete(User user)
        {
            user.DeletedAt = DateTime.Now;
            _context.Users.Update(user);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
