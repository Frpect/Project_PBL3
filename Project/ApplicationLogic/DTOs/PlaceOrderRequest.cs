using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs
{
    public class PlaceOrderRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int ShippingAddressId { get; set; }

        public int? PromotionId { get; set; }
    }
}
