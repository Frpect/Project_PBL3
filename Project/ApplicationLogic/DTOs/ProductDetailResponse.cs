namespace Project.ApplicationLogic.DTOs
{
    public class ProductDetailResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }

        public string Description { get; set; }
        public string CategoryName { get; set; }

        public decimal Price { get; set; }

        public List<string> Images { get; set; }

        public List<string> Sizes { get; set; }
        public List<string> Colors { get; set; }


        public List<ProductVariantDto> Variants { get; set; }
    }
}
