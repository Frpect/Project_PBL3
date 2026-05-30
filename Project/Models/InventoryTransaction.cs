using System;
using System.Collections.Generic;

namespace Project.DataLayer.Models;

public partial class InventoryTransaction
{
    public int TransactionId { get; set; }

    public int? VariantId { get; set; }

    public int? Quantity { get; set; }

    public string? Type { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ProductVariant? Variant { get; set; }
}
