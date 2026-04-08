using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.Service;
using Project.ApplicationLogic.DTOs;

namespace Project.Presentation_Layer.Controller
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private UserService service;

        public UserController(UserService service)
        {
            this.service = service;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest req)
        {
            try
            {
                service.Register(req);
                return Ok(new { message = "Register success" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            try
            {
                var user = service.Login(req);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
