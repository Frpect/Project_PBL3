using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service;

/// <summary>
/// Stub tích hợp VNPay/Momo: trả về URL giả lập. Khi có key thật, thay bằng SDK/HTTP tới cổng thanh toán.
/// </summary>
public class PaymentService : IPaymentService
{
    public Task<CreatePaymentUrlResponse> CreatePaymentUrlAsync(CreatePaymentUrlRequest request, CancellationToken cancellationToken = default)
    {
        var provider = (request.Provider ?? "vnpay").Trim().ToLowerInvariant();
        var returnUrl = string.IsNullOrWhiteSpace(request.ReturnUrl)
            ? "http://localhost:3456/payment/return"
            : request.ReturnUrl!.Trim();

        var enc = Uri.EscapeDataString(returnUrl);
        string url = provider switch
        {
            "momo" => $"https://test-payment.momo.vn/stub?orderId={request.OrderId}&amount={request.Amount}&returnUrl={enc}",
            _ => $"https://sandbox.vnpayment.vn/paymentv2/stub.html?orderId={request.OrderId}&amount={request.Amount}&returnUrl={enc}"
        };

        return Task.FromResult(new CreatePaymentUrlResponse
        {
            PaymentUrl = url,
            Provider = provider,
            Note = "Stub URL for development. Replace PaymentService with real gateway integration."
        });
    }
}
