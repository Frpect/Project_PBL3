namespace Project.ApplicationLogic.DTOs
{
    public class PaymentCreateUrlRequest
    {
        public int OrderId { get; set; }
        public string? Provider { get; set; } // e.g. "vnpay" or "momo"
        public long? Amount { get; set; } // optional
    }
}