using System;
using System.Collections.Generic;

namespace Project.DataLayer.Models;

public partial class Address
{
    public int AddressId { get; set; }

    public int UserId { get; set; }

    public string? RecipientName { get; set; }

    public string? Phone { get; set; }

    public string? Province { get; set; }

    public string? District { get; set; }

    public string? Ward { get; set; }

    public string? StreetAddress { get; set; }

    public string? AddressType { get; set; }

    public bool? IsDefault { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual User User { get; set; } = null!;
}
