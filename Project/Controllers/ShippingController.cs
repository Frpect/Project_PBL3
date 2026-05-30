using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;

namespace Project.PresentationLayer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShippingController : ControllerBase
{
    // GET /api/Shipping/fees?address=...
    [HttpGet("fees")]
    public IActionResult GetFees([FromQuery] string? address)
    {
        // Minimal logic: fixed fee (30_000). Replace with real calculation (distance, weight, carrier).
        var fee = 30000m;
        var response = new ShippingFeeResponse
        {
            Fee = fee,
            Currency = "VND"
        };
        return Ok(response);
    }
}
