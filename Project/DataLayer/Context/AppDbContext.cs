using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Models;

namespace Project.DataLayer.Context;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Inventory> Inventories { get; set; }

    public virtual DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductImage> ProductImages { get; set; }

    public virtual DbSet<ProductVariant> ProductVariants { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=HOANGVIPPRO\\SQLEXPRESS;Database=FASHIONSTORE;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Cart__2EF52A27F0263C13");

            entity.HasOne(d => d.User).WithMany(p => p.Carts).HasConstraintName("FK__Cart__user_id__114A936A");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.CartItemId).HasName("PK__CartItem__5D9A6C6EF22880BE");

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems).HasConstraintName("FK__CartItem__cart_i__151B244E");

            entity.HasOne(d => d.Variant).WithMany(p => p.CartItems).HasConstraintName("FK__CartItem__varian__160F4887");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Category__D54EE9B45455A712");
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.InventoryId).HasName("PK__Inventor__B59ACC49E9DB7592");

            entity.HasOne(d => d.Variant).WithMany(p => p.Inventories).HasConstraintName("FK__Inventory__varia__1332DBDC");
        });

        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId).HasName("PK__Inventor__85C600AFB5B7C07B");

            entity.Property(e => e.TransactionId).ValueGeneratedNever();

            entity.HasOne(d => d.Variant).WithMany(p => p.InventoryTransactions).HasConstraintName("FK__Inventory__varia__10566F31");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__46596229573752BE");

            entity.Property(e => e.OrderStatus).HasDefaultValue("pending");

            entity.HasOne(d => d.Promotion).WithMany(p => p.Orders).HasConstraintName("FK__Orders__promotio__14270015");

            entity.HasOne(d => d.User).WithMany(p => p.Orders).HasConstraintName("FK__Orders__user_id__0C85DE4D");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__3C5A40809E7BBD16");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails).HasConstraintName("FK__OrderDeta__order__123EB7A3");

            entity.HasOne(d => d.Variant).WithMany(p => p.OrderDetails).HasConstraintName("FK__OrderDeta__varia__0E6E26BF");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EA2A1DF107");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments).HasConstraintName("FK__Payment__order_i__0A9D95DB");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Product__47027DF5F6CD2B0D");

            entity.HasOne(d => d.Category).WithMany(p => p.Products).HasConstraintName("FK__Product__categor__09A971A2");
        });

        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.HasKey(e => e.ImageId).HasName("PK__ProductI__DC9AC955D246DD6F");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductImages).HasConstraintName("FK__ProductIm__produ__0F624AF8");
        });

        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasKey(e => e.VariantId).HasName("PK__ProductV__EACC68B75F46DD4E");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductVariants).HasConstraintName("FK__ProductVa__produ__0D7A0286");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__2CB9556B58548258");

            entity.Property(e => e.Status).HasDefaultValue("active");

            entity.HasMany(d => d.Categories).WithMany(p => p.Promotions)
                .UsingEntity<Dictionary<string, object>>(
                    "CategoryProduct",
                    r => r.HasOne<Category>().WithMany()
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__CategoryP__categ__17F790F9"),
                    l => l.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__CategoryP__promo__17036CC0"),
                    j =>
                    {
                        j.HasKey("PromotionId", "CategoryId").HasName("PK__Category__71EDBBF0C6A1C470");
                        j.ToTable("CategoryProduct");
                        j.IndexerProperty<int>("PromotionId").HasColumnName("promotion_id");
                        j.IndexerProperty<int>("CategoryId").HasColumnName("category_id");
                    });
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__760965CCD3A3867A");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__B9BE370F5BEC7C4C");

            entity.Property(e => e.Status)
                .HasDefaultValue("active")
                .HasComment("đang hoạt động/khóa");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__User__role_id__0B91BA14");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
