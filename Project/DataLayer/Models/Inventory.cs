using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("Inventory")]
[Index("InventoryId", Name = "UQ__Inventor__B59ACC480D07B8B4", IsUnique = true)]
public partial class Inventory
{
    [Key]
    [Column("inventory_id")]
    public int InventoryId { get; set; }

    [Column("variant_id")]
    public int? VariantId { get; set; }

    [Column("quantity")]
    public int? Quantity { get; set; }

    [Column("last_updated", TypeName = "datetime")]
    public DateTime? LastUpdated { get; set; }

    [ForeignKey("VariantId")]
    [InverseProperty("Inventories")]
    public virtual ProductVariant? Variant { get; set; }
}
