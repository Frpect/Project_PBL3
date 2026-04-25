using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.Service;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly IUserService _service;

        public CustomerController(IUserService service)
        {
            _service = service;
        }

        // 🔹 GET: api/customer
        // 🔹 GET: api/customer?search=nguyen
        [HttpGet]
        public IActionResult GetAll([FromQuery] string? search)
        {
            try
            {
                var result = _service.GetCustomers(search);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
