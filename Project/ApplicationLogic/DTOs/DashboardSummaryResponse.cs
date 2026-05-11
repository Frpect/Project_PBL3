namespace Project.ApplicationLogic.DTOs
{
    public class DashboardSummaryResponse
    {
        public int TotalOrders { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalProducts { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}