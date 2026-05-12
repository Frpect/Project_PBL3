using System;

namespace Project.ApplicationLogic.DTOs
{
    public class PromotionRequest
    {
        public int PromotionId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? DiscountType { get; set; } // e.g. "percentage" or "fixed"
        public decimal DiscountValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}