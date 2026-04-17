namespace Project.ApplicationLogic.DTOs
{
    public class ProductResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string CategoryName { get; set; }

        public string Thumbnail { get; set; } // ảnh đầu tiên
        public decimal Price { get; set; } // giá hiển thị
    }
}
