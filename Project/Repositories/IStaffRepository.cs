using Project.DataLayer.Models;

namespace Project.DataLayer.Repository
{
    public interface IStaffRepository
    {
        Task<List<User>> GetAllStaffAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByPhoneAsync(string phone);
        Task AddAsync(User user);
        void Update(User user);
        void Delete(User user);
        Task SaveChangesAsync();
    }
}
