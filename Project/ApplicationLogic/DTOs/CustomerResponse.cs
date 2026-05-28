namespace Project.ApplicationLogic.DTOs
{
    public class CustomerResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
    }
}
