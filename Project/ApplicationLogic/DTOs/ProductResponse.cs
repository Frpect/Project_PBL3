using System.Collections.Generic;

namespace Project.ApplicationLogic.DTOs
{
    public class ProductResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string CategoryName { get; set; }

        public string Thumbnail { get; set; }
        public string ImageUrl { get; set; }
        public string Sku { get; set; }

        public decimal Price { get; set; }
        public decimal BasePrice { get; set; }
        public decimal? SalePrice { get; set; }

        public int TotalStock { get; set; }
        public bool IsActive { get; set; } = true;

        public List<ProductVariantDto> Variants { get; set; } = new();
    }
}
