using System.Security.Cryptography;
using System.Text;

namespace Project.ApplicationLogic.Service
{
    public class PasswordHasher : IPasswordHasher
    {
        private const string Salt = "PBL3_Project_Secret_Salt_2024"; // Fixed salt for simplicity, better than none

        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var saltedPassword = password + Salt;
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            return Convert.ToBase64String(bytes);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }
    }
}
