namespace Project.ApplicationLogic.DTOs
{
    public class CartResponse
    {
        public int CartId { get; set; }
        public List<CartItemResponse> Items { get; set; }
        public decimal Total { get; set; }
    }
}
