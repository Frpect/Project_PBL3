using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SizesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SizesController(AppDbContext context) { _context = context; }

        // GET /api/sizes
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Sizes
                .Select(s => new { sizeId = s.SizeId, sizeName = s.SizeName })
                .ToListAsync();
            return Ok(list);
        }
    }
}
