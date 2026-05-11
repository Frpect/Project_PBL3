namespace Project.ApplicationLogic.DTOs;

public class CreatePaymentUrlRequest
{
    public int OrderId { get; set; }
    /// <summary>VNPay, Momo, etc.</summary>
    public string Provider { get; set; } = "vnpay";
    public decimal Amount { get; set; }
    public string? ReturnUrl { get; set; }
}

public class CreatePaymentUrlResponse
{
    public string PaymentUrl { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
}
