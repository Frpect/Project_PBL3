using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Index("UserId", Name = "Orders_index_0")]
[Index("OrderId", Name = "UQ__Orders__465962281A8B8F6D", IsUnique = true)]
public partial class Order
{
    [Key]
    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("promotion_id")]
    public int? PromotionId { get; set; }

    [Column("total_amount", TypeName = "decimal(18, 0)")]
    public decimal? TotalAmount { get; set; }

    [Column("discount_amount", TypeName = "decimal(18, 0)")]
    public decimal? DiscountAmount { get; set; }

    [Column("order_status")]
    [StringLength(255)]
    [Unicode(false)]
    public string? OrderStatus { get; set; }

    [Column("order_date", TypeName = "datetime")]
    public DateTime? OrderDate { get; set; }

    [Column("shipping_address")]
    [StringLength(255)]
    [Unicode(false)]
    public string? ShippingAddress { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("Order")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    [ForeignKey("PromotionId")]
    [InverseProperty("Orders")]
    public virtual Promotion? Promotion { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Orders")]
    public virtual User? User { get; set; }
}
