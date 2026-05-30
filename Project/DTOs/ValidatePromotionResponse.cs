namespace Project.ApplicationLogic.DTOs
{
    public class ValidatePromotionResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
    }
}