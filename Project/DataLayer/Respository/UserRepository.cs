//using Project.DataLayer.Models;
using Microsoft.Data.SqlClient;
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
                .FirstOrDefault(u => u.Username == identifier || u.Email == identifier);
        }

        public void Add(User user)
        {
            _context.Users.Add(user);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
