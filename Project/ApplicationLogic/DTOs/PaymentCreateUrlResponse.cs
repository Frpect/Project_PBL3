namespace Project.ApplicationLogic.DTOs
{
    public class PaymentCreateUrlResponse
    {
        public string Url { get; set; } = string.Empty;
        public int ExpiresInSeconds { get; set; }
    }
}