using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("Promotion")]
[Index("PromotionId", Name = "UQ__Promotio__2CB9556AC1816D60", IsUnique = true)]
public partial class Promotion
{
    [Key]
    [Column("promotion_id")]
    public int PromotionId { get; set; }

    [Column("promotion_name")]
    [StringLength(255)]
    [Unicode(false)]
    public string? PromotionName { get; set; }

    [Column("discount_value", TypeName = "decimal(18, 0)")]
    public decimal? DiscountValue { get; set; }

    [Column("discount_type")]
    [StringLength(255)]
    [Unicode(false)]
    public string? DiscountType { get; set; }

    [Column("start_date", TypeName = "datetime")]
    public DateTime? StartDate { get; set; }

    [Column("end_date", TypeName = "datetime")]
    public DateTime? EndDate { get; set; }

    [Column("status")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Status { get; set; }

    [InverseProperty("Promotion")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [ForeignKey("PromotionId")]
    [InverseProperty("Promotions")]
    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
}
