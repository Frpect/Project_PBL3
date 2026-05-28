using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ColorsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ColorsController(AppDbContext context) { _context = context; }

        // GET /api/colors
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Colors
                .Select(c => new { colorId = c.ColorId, colorName = c.ColorName })
                .ToListAsync();
            return Ok(list);
        }
    }
}
