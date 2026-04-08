using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{
    public interface IUserRepository
    {
        User GetByUsername(string username);
        void Add(User user);
    }
}
