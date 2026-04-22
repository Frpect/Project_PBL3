using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{

    public interface IUserRepository
    {
        User GetByIdentifier(string identifier);
        User? GetById(int userId);
        void Add(User user);
        void Save();
    }
}
