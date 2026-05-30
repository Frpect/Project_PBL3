using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs
{
    public class LoginRequest
    {
        [Required]
        [MinLength(4)]
        public string Identifier { get; set; } 

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }
}
