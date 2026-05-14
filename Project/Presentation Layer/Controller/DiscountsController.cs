using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiscountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DiscountsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/Discounts
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Promotions
                .Where(p => p.Status == "active")
                .Select(p => new PromotionRequest
                {
                    PromotionId = p.PromotionId,
                    Code = p.PromotionName,
                    DiscountType = p.DiscountType,
                    DiscountValue = p.DiscountValue ?? 0,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate
                }).ToListAsync();

            return Ok(list);
        }

        // POST /api/Discounts
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PromotionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest(new { message = "Code is required" });

            var promo = new Promotion
            {
                PromotionName = request.Code,
                DiscountType = request.DiscountType,
                DiscountValue = request.DiscountValue,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = "active"
            };

            _context.Promotions.Add(promo);
            await _context.SaveChangesAsync();

            request.PromotionId = promo.PromotionId;
            return Ok(request);
        }

        // GET /api/Discounts/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var p = await _context.Promotions.FindAsync(id);
            if (p == null) return NotFound();

            var dto = new PromotionRequest
            {
                PromotionId = p.PromotionId,
                Code = p.PromotionName,
                DiscountType = p.DiscountType,
                DiscountValue = p.DiscountValue ?? 0,
                StartDate = p.StartDate,
                EndDate = p.EndDate
            };
            return Ok(dto);
        }

        // PUT /api/Discounts/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PromotionRequest request)
        {
            var p = await _context.Promotions.FindAsync(id);
            if (p == null) return NotFound();

            p.PromotionName = request.Code;
            p.DiscountType = request.DiscountType;
            p.DiscountValue = request.DiscountValue;
            p.StartDate = request.StartDate;
            p.EndDate = request.EndDate;

            _context.Promotions.Update(p);
            await _context.SaveChangesAsync();

            return Ok(request);
        }

        // DELETE /api/Discounts/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var p = await _context.Promotions.FindAsync(id);
            if (p == null) return NotFound();

            // soft delete or mark inactive
            p.Status = "inactive";
            _context.Promotions.Update(p);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Promotion deactivated" });
        }

        // POST /api/Discounts/validate
        [AllowAnonymous]
        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidatePromotionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest(new { message = "Code is required" });

            var now = DateTime.Now;
            var promo = await _context.Promotions
                .FirstOrDefaultAsync(p => p.PromotionName == request.Code && p.Status == "active");

            if (promo == null)
                return Ok(new ValidatePromotionResponse { IsValid = false, Message = "Promotion not found or inactive" });

            if (promo.StartDate.HasValue && promo.StartDate > now)
                return Ok(new ValidatePromotionResponse { IsValid = false, Message = "Promotion not started yet" });

            if (promo.EndDate.HasValue && promo.EndDate < now)
                return Ok(new ValidatePromotionResponse { IsValid = false, Message = "Promotion expired" });

            // check min order value if you have such field (not present). For now return discount amount based on type.
            decimal discount = 0;
            if (promo.DiscountType == "percentage")
            {
                discount = Math.Round((request.OrderTotal * (promo.DiscountValue ?? 0)) / 100m, 0);
            }
            else
            {
                discount = promo.DiscountValue ?? 0;
            }

            return Ok(new ValidatePromotionResponse
            {
                IsValid = true,
                Message = "Promotion valid",
                DiscountAmount = discount
            });
        }
    }
}
