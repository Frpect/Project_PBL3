using System;

using System.Collections.Generic;



namespace Project.DataLayer.Models;



public partial class Product

{

    public int ProductId { get; set; }



    public int? CategoryId { get; set; }



    public string? ProductName { get; set; }



    public string? Description { get; set; }



    public string? Status { get; set; }



    public DateTime? CreatedAt { get; set; }



    public DateTime? DeletedAt { get; set; }



    public virtual Category? Category { get; set; }



    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();



    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();

}

