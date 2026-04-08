using Project.DataLayer.Models;
using Microsoft.Data.SqlClient;
namespace Project.DataLayer.Respository
{
    public class UserRepository : IUserRepository
    {
        private string connectionString = "Server=HOANG\\SQLEXPRESS;Database=FASHIONSTORE;Trusted_Connection=True;TrustServerCertificate=True;";

        public User GetByUsername(string username)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = "SELECT * FROM [User] WHERE username = @username";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@username", username);

                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new User
                    {
                        user_id = (int)reader["user_id"],
                        username = reader["username"].ToString(),
                        password_hash = reader["password_hash"].ToString(),
                        email = reader["email"].ToString()
                    };
                }
            }
            return null;
        }

        public void Add(User user)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                string query = @"INSERT INTO [User] 
                            (username, password_hash, email, role_id, created_at)
                            VALUES (@username, @password, @email, 2, GETDATE())";

                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@username", user.username);
                cmd.Parameters.AddWithValue("@password", user.password_hash);
                cmd.Parameters.AddWithValue("@email", user.email);

                conn.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
