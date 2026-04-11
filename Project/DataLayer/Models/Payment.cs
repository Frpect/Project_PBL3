using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Project.DataLayer.Models;

[Table("Payment")]
[Index("PaymentId", Name = "UQ__Payment__ED1FC9EB3C36C7C2", IsUnique = true)]
public partial class Payment
{
    [Key]
    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("order_id")]
    public int? OrderId { get; set; }

    [Column("payment_method")]
    [StringLength(255)]
    [Unicode(false)]
    public string? PaymentMethod { get; set; }

    [Column("payment_status")]
    [StringLength(255)]
    [Unicode(false)]
    public string? PaymentStatus { get; set; }

    [Column("payment_date", TypeName = "datetime")]
    public DateTime? PaymentDate { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("Payments")]
    public virtual Order? Order { get; set; }
}
