namespace Project.ApplicationLogic.DTOs
{
    public class ValidatePromotionRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal OrderTotal { get; set; }
    }
}