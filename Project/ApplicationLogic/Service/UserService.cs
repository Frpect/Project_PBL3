namespace Project.ApplicationLogic.Service
{
    using System.Security.Cryptography;
    using System.Text;
    using Project.ApplicationLogic.DTOs;
    using Project.DataLayer.Models;
    using Project.DataLayer.Respository;

    public class UserService
    {
        private IUserRepository repo;

        public UserService(IUserRepository repo)
        {
            this.repo = repo;
        }

        // 🔐 Hash password
        private string HashPassword(string password)
        {
            using (SHA256 sha = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        // 📝 Register
        public void Register(RegisterRequest req)
        {
            var existing = repo.GetByUsername(req.username);
            if (existing != null)
                throw new Exception("Username already exists");

            var user = new User
            {
                username = req.username,
                password_hash = HashPassword(req.password),
                email = req.email
            };

            repo.Add(user);
        }

        // 🔑 Login
        public UserResponse Login(LoginRequest req)
        {
            var user = repo.GetByUsername(req.username);
            if (user == null)
                throw new Exception("User not found");

            var hashed = HashPassword(req.password);
            if (user.password_hash != hashed)
                throw new Exception("Wrong password");

            return new UserResponse
            {
                user_id = user.user_id,
                username = user.username,
                email = user.email
            };
        }
    }
}
