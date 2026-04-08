namespace Project.DataLayer.Models
{
    public class Role
    {
        public int role_id { get; set; }
        public string role_name { get; set; }

        public List<User> Users { get; set; }
    }
}
