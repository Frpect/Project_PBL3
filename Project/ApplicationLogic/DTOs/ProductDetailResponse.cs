namespace Project.ApplicationLogic.DTOs
{
    public class ProductDetailResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Sku { get; set; }
        public decimal BasePrice { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; } = true;
        public string? ImageUrl { get; set; }
        public int TotalStock { get; set; }
        public List<string> Images { get; set; } = new();
        public List<string> Sizes { get; set; } = new();
        public List<string> Colors { get; set; } = new();
        public List<ProductVariantDto> Variants { get; set; } = new();
    }
}
