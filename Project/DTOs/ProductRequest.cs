using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs
{
    public class ProductRequest
    {
        [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
        [StringLength(200, MinimumLength = 2)]
        public string ProductName { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal BasePrice { get; set; }

        public bool IsActive { get; set; } = true;

        public List<ProductVariantRequest>? Variants { get; set; }
    }

    public class ProductVariantRequest
    {
        [Required]
        public string Size { get; set; } = string.Empty;

        [Required]
        public string Color { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public string? Sku { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }
    }
}
