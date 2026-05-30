using System;
using System.Collections.Generic;

namespace Project.DataLayer.Models;

public partial class CartItem
{
    public int CartItemId { get; set; }

    public int? CartId { get; set; }

    public int? VariantId { get; set; }

    public int? Quantity { get; set; }

    public decimal? Price { get; set; }

    public virtual Cart? Cart { get; set; }

    public virtual ProductVariant? Variant { get; set; }
}
