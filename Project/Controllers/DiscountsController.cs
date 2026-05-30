using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.DTOs;
using Project.ApplicationLogic.Service;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiscountsController : ControllerBase
    {
        private readonly IDiscountService _service;

        public DiscountsController(IDiscountService service)
        {
            _service = service;
        }

        // GET /api/Discounts  (active only — dùng cho checkout)
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _service.GetAllAsync(cancellationToken);
            var active = list.Where(d => d.Status == "active").ToList();
            return Ok(active);
        }

        // GET /api/Discounts/all  (admin — kể cả inactive)
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllAdmin(CancellationToken cancellationToken)
        {
            var list = await _service.GetAllAsync(cancellationToken);
            return Ok(list);
        }

        // GET /api/Discounts/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            try
            {
                var dto = await _service.GetByIdAsync(id, cancellationToken);
                return Ok(dto);
            }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // POST /api/Discounts
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDiscountRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var dto = await _service.CreateAsync(request, cancellationToken);
                return Ok(dto);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // PUT /api/Discounts/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDiscountRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var dto = await _service.UpdateAsync(id, request, cancellationToken);
                return Ok(dto);
            }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // DELETE /api/Discounts/{id}
        [Authorize(Policy = "StaffOrAdmin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _service.DeleteAsync(id, cancellationToken);
                return Ok(new { message = "Promotion deleted" });
            }
            catch (NotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // POST /api/Discounts/apply  (alias for validate)
        [AllowAnonymous]
        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromBody] ValidateDiscountRequest request, CancellationToken cancellationToken)
            => await Validate(request, cancellationToken);

        // POST /api/Discounts/validate
        [AllowAnonymous]
        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidateDiscountRequest request, CancellationToken cancellationToken)
        {
            var result = await _service.ValidateAsync(request, cancellationToken);
            return Ok(result);
        }
    }
}
