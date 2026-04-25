namespace Project.ApplicationLogic.DTOs
{
    public class CustomerResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
