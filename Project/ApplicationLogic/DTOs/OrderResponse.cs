namespace Project.ApplicationLogic.DTOs
{
    public class OrderResponse
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string OrderStatus { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal Total { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public int? CustomerId { get; set; }
        public string PaymentStatus { get; set; } = "pending";
        public string PaymentMethod { get; set; } = string.Empty;
        public List<OrderItemResponse> Items { get; set; } = new();
    }
}
