using System.Collections.Generic;

namespace Project.ApplicationLogic.DTOs
{
    public class ProductRequest
    {
        public string ProductName { get; set; }
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public bool IsActive { get; set; } = true;
        public List<ProductVariantRequest>? Variants { get; set; }
    }

    public class ProductVariantRequest
    {
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string? Sku { get; set; }
        public decimal? Price { get; set; }
    }
}
