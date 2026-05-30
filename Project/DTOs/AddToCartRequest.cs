using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs
{
    public class AddToCartRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int VariantId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }
}
