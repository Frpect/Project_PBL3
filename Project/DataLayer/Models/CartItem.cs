using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("CartItem")]
[Index("VariantId", Name = "CartItem_index_0")]
[Index("CartItemId", Name = "UQ__CartItem__5D9A6C6F22A25E38", IsUnique = true)]
public partial class CartItem
{
    [Key]
    [Column("cart_item_id")]
    public int CartItemId { get; set; }

    [Column("cart_id")]
    public int? CartId { get; set; }

    [Column("variant_id")]
    public int? VariantId { get; set; }

    [Column("quantity")]
    public int? Quantity { get; set; }

    [Column("price", TypeName = "decimal(18, 0)")]
    public decimal? Price { get; set; }

    [ForeignKey("CartId")]
    [InverseProperty("CartItems")]
    public virtual Cart? Cart { get; set; }

    [ForeignKey("VariantId")]
    [InverseProperty("CartItems")]
    public virtual ProductVariant? Variant { get; set; }
}
