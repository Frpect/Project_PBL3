using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("ProductImage")]
[Index("ImageId", Name = "UQ__ProductI__DC9AC9540F5C9129", IsUnique = true)]
public partial class ProductImage
{
    [Key]
    [Column("image_id")]
    public int ImageId { get; set; }

    [Column("product_id")]
    public int? ProductId { get; set; }

    [Column("image_url")]
    [StringLength(255)]
    [Unicode(false)]
    public string? ImageUrl { get; set; }

    [Column("is_primary")]
    [StringLength(255)]
    [Unicode(false)]
    public string? IsPrimary { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("ProductImages")]
    public virtual Product? Product { get; set; }
}
