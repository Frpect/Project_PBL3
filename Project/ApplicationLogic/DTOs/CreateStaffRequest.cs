using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs
{
    public class CreateStaffRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        [Required]
        public int RoleId { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
