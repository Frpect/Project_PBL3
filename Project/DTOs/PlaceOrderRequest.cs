using System.Collections.Generic;
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
        public string? DiscountCode { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? PaymentMethod { get; set; }

        public List<OrderItemRequest>? Items { get; set; }
    }

    public class OrderItemRequest
    {
        public int VariantId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
