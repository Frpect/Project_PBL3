using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface IStaffRepository
    {
        Task<List<User>> GetAllStaffAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        void Update(User user);
        void Delete(User user);
        Task SaveChangesAsync();
    }
}
