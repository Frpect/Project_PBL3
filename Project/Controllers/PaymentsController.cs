using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Context;

namespace Project.PresentationLayer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaymentsController(AppDbContext context)
    {
        _context = context;
    }

    // POST: /api/Payments/create-url
    // Returns a payment redirect URL (placeholder). Integrate real gateway SDK later.
    [HttpPost("create-url")]
    public IActionResult CreatePaymentUrl([FromBody] PaymentCreateUrlRequest request)
    {
        if (request == null || request.OrderId <= 0)
            return BadRequest(new { message = "OrderId is required" });

        // Basic placeholder link — replace with real integration to VNPay/Momo.
        var provider = string.IsNullOrWhiteSpace(request.Provider) ? "vnpay" : request.Provider.ToLowerInvariant();
        var token = Guid.NewGuid().ToString("N");
        var url = $"https://payments.example.com/{provider}/pay?orderId={request.OrderId}&token={token}";

        var response = new PaymentCreateUrlResponse
        {
            Url = url,
            ExpiresInSeconds = 900
        };

        return Ok(response);
    }
}
