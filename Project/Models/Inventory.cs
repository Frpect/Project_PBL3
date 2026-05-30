using System;
using System.Collections.Generic;

namespace Project.DataLayer.Models;

public partial class Inventory
{
    public int InventoryId { get; set; }

    public int? VariantId { get; set; }

    public int? Quantity { get; set; }

    public DateTime? LastUpdated { get; set; }

    public virtual ProductVariant? Variant { get; set; }
}
