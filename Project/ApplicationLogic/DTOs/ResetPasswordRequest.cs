using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs
{
    public class ResetPasswordRequest
    {
        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }
}
