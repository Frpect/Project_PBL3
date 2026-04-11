using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("InventoryTransaction")]
public partial class InventoryTransaction
{
    [Key]
    [Column("transaction_id")]
    public int TransactionId { get; set; }

    [Column("variant_id")]
    public int? VariantId { get; set; }

    [Column("quantity")]
    public int? Quantity { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("type")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Type { get; set; }

    [Column("note")]
    [StringLength(255)]
    [Unicode(false)]
    public string? Note { get; set; }

    [ForeignKey("VariantId")]
    [InverseProperty("InventoryTransactions")]
    public virtual ProductVariant? Variant { get; set; }
}
