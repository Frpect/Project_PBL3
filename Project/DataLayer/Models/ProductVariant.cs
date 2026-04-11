using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("ProductVariant")]
[Index("ProductId", Name = "ProductVariant_index_0")]
[Index("VariantId", Name = "UQ__ProductV__EACC68B680A2B427", IsUnique = true)]
public partial class ProductVariant
{
    [Key]
    [Column("variant_id")]
    public int VariantId { get; set; }

    [Column("product_id")]
    public int? ProductId { get; set; }

    [Column("size")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Size { get; set; }

    [Column("color")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Color { get; set; }

    [Column("price", TypeName = "decimal(18, 0)")]
    public decimal? Price { get; set; }

    [Column("sku")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Sku { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Variant")]
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    [InverseProperty("Variant")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [InverseProperty("Variant")]
    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();

    [InverseProperty("Variant")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [ForeignKey("ProductId")]
    [InverseProperty("ProductVariants")]
    public virtual Product? Product { get; set; }
}
