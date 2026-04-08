using System.Data;

namespace Project.DataLayer.Models
{
    public class User
    {
        public int user_id { get; set; }
        public string username { get; set; }
        public string password_hash { get; set; }
        public string email { get; set; }
        public int role_id { get; set; }
        public string status { get; set; }
        public DateTime created_at { get; set; }
        public string full_name { get; set; }
        public string phone { get; set; }

        // Navigation
        public Role Role { get; set; }
    }
}
