using Microsoft.AspNetCore.Mvc;
using TestCautruc.Application_Logic.Service;

namespace TestCautruc.Presentation_Layer.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _service = new ProductService();

        [HttpGet]
        public IActionResult Get()
        {
            var data = _service.GetAll();
            return Ok(data);
        }
    }
}
