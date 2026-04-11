using Project.DataLayer.Models;

namespace Project.DataLayer.Respository
{

    public interface IUserRepository
    {
        
        User GetByIdentifier(string identifier);
        void Add(User user);
        void Save();
    }
}
