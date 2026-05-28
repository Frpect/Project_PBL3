using System;

namespace Project.ApplicationLogic.DTOs
{
    public class PromotionRequest
    {
        public int PromotionId { get; set; }
        public string? Name { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal? MinOrder { get; set; }
        public decimal? MaxDiscount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public bool IsActive { get; set; } = true;
    }
}