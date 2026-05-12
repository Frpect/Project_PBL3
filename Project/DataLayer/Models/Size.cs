using System;
using System.Collections.Generic;

namespace Project.DataLayer.Models;

public partial class Size
{
    public int SizeId { get; set; }

    public string? SizeName { get; set; }

    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
}
