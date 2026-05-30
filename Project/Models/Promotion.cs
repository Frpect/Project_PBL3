using System;
using System.Collections.Generic;

namespace Project.DataLayer.Models;

public partial class Promotion
{
    public int PromotionId { get; set; }

    public string? PromotionName { get; set; }

    public decimal? DiscountValue { get; set; }

    public string? DiscountType { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
}
