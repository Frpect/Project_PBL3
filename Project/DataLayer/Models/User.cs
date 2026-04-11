using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("User")]
[Index("UserId", Name = "UQ__User__B9BE370E391FF153", IsUnique = true)]
[Index("Username", Name = "UQ__User__F3DBC5722831AB56", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("username")]
    [StringLength(50)]
    [Unicode(false)]
    public string Username { get; set; } = null!;

    [Column("password_hash")]
    [StringLength(255)]
    [Unicode(false)]
    public string PasswordHash { get; set; } = null!;

    [Column("email")]
    [StringLength(100)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [Column("role_id")]
    public int RoleId { get; set; }

    /// <summary>
    /// đang hoạt động/khóa
    /// </summary>
    [Column("status")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Status { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("full_name")]
    [StringLength(255)]
    [Unicode(false)]
    public string? FullName { get; set; }

    [Column("phone")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Phone { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    [InverseProperty("User")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [ForeignKey("RoleId")]
    [InverseProperty("Users")]
    public virtual Role Role { get; set; } = null!;
}
