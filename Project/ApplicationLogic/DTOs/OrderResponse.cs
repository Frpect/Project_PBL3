namespace Project.ApplicationLogic.DTOs
{
    public class OrderResponse
    {
        public int OrderId { get; set; }
        public string OrderStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public string ShippingAddress { get; set; }
        public List<OrderItemResponse> Items { get; set; }
    }
}
