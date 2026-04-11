using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("OrderDetail")]
[Index("OrderDetailId", Name = "UQ__OrderDet__3C5A40813AE02299", IsUnique = true)]
public partial class OrderDetail
{
    [Key]
    [Column("order_detail_id")]
    public int OrderDetailId { get; set; }

    [Column("order_id")]
    public int? OrderId { get; set; }

    [Column("variant_id")]
    public int? VariantId { get; set; }

    [Column("quantity")]
    public int? Quantity { get; set; }

    [Column("price", TypeName = "decimal(18, 0)")]
    public decimal? Price { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("OrderDetails")]
    public virtual Order? Order { get; set; }

    [ForeignKey("VariantId")]
    [InverseProperty("OrderDetails")]
    public virtual ProductVariant? Variant { get; set; }
}
