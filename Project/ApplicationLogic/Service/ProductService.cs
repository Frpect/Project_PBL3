using Microsoft.EntityFrameworkCore;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Context;
using Project.DataLayer.Models;
using Project.DataLayer.Respository;
using System.Threading;

namespace Project.ApplicationLogic.Service
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;
        private readonly AppDbContext _db;

        public ProductService(IProductRepository repo, AppDbContext db)
        {       
            _repo = repo;
            _db = db;
        }

        // 🔹 Lấy danh sách product (gọn)
        public async Task<List<ProductResponse>> GetAllAsync()
        {
            var products = await _repo.GetAllAsync();

            return products.Select(p =>
            {
                var firstVariant = p.ProductVariants.FirstOrDefault();
                var imageUrl = p.ProductImages.FirstOrDefault()?.ImageUrl;
                var totalStock = p.ProductVariants
                    .SelectMany(v => v.Inventories)
                    .Sum(i => i.Quantity ?? 0);

                return new ProductResponse
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    CategoryName = p.Category?.CategoryName,
                    Thumbnail = imageUrl,
                    ImageUrl = imageUrl,
                    Sku = firstVariant?.Sku,
                    Price = firstVariant?.Price ?? 0,
                    BasePrice = firstVariant?.Price ?? 0,
                    TotalStock = totalStock,
                    IsActive = p.Status == "active" || p.Status == null,
                    Variants = p.ProductVariants.Select(v => new ProductVariantDto
                    {
                        VariantId = v.VariantId,
                        Sku = v.Sku,
                        Size = v.Size?.SizeName ?? string.Empty,
                        Color = v.Color?.ColorName ?? string.Empty,
                        Price = v.Price ?? 0,
                        Stock = v.Inventories.Sum(i => i.Quantity ?? 0)
                    }).ToList()
                };
            }).ToList();
        }

        // 🔹 Lấy chi tiết product
        public async Task<ProductDetailResponse> GetByIdAsync(int id)
        {
            var p = await _repo.GetByIdAsync(id);

            if (p == null)
                throw new Exception("Product not found");

            var firstVariant = p.ProductVariants.FirstOrDefault();
            var imageUrl = p.ProductImages.FirstOrDefault()?.ImageUrl;
            var totalStock = p.ProductVariants.SelectMany(v => v.Inventories).Sum(i => i.Quantity ?? 0);

            return new ProductDetailResponse
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName ?? string.Empty,
                Description = p.Description,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                Sku = firstVariant?.Sku,
                BasePrice = firstVariant?.Price ?? 0,
                Price = firstVariant?.Price ?? 0,
                IsActive = p.Status == "active" || p.Status == null,
                ImageUrl = imageUrl,
                TotalStock = totalStock,

                Images = p.ProductImages.Select(i => i.ImageUrl).OfType<string>().ToList(),

                Sizes = p.ProductVariants
                    .Select(v => v.Size?.SizeName)
                    .OfType<string>()
                    .Distinct()
                    .ToList(),

                Colors = p.ProductVariants
                    .Select(v => v.Color?.ColorName)
                    .OfType<string>()
                    .Distinct()
                    .ToList(),

                Variants = p.ProductVariants.Select(v => new ProductVariantDto
                {
                    VariantId = v.VariantId,
                    Sku = v.Sku,
                    Size = v.Size?.SizeName ?? string.Empty,
                    Color = v.Color?.ColorName ?? string.Empty,
                    Price = v.Price ?? 0,
                    Stock = v.Inventories?.Sum(i => i.Quantity) ?? 0
                }).ToList()
            };
        }

        // 🔹 Tạo product
        public async Task<int> CreateAsync(ProductRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ProductName))
                throw new Exception("Product name is required");

            if (!await _repo.CategoryExistsAsync(request.CategoryId))
                throw new Exception("Category not found");

            var product = new Product
            {
                ProductName = request.ProductName,
                CategoryId = request.CategoryId,
                Description = request.Description,
                Status = request.IsActive ? "active" : "inactive",
                CreatedAt = DateTime.Now
            };

            await _repo.AddAsync(product);
            await _repo.SaveChangesAsync();

            if (request.Variants != null && request.Variants.Any())
                await SaveVariantsAsync(product.ProductId, request.Variants, request.BasePrice);

            return product.ProductId;
        }

        // 🔹 Cập nhật product
        public async Task UpdateAsync(int id, ProductRequest request)
        {
            var product = await _repo.GetByIdAsync(id);

            if (product == null)
                throw new Exception("Product not found");

            if (string.IsNullOrWhiteSpace(request.ProductName))
                throw new Exception("Product name is required");

            if (!await _repo.CategoryExistsAsync(request.CategoryId))
                throw new Exception("Category not found");

            product.ProductName = request.ProductName;
            product.CategoryId = request.CategoryId;
            product.Description = request.Description;
            product.Status = request.IsActive ? "active" : "inactive";

            _repo.Update(product);
            await _repo.SaveChangesAsync();

            if (request.Variants != null && request.Variants.Any())
                await SaveVariantsAsync(id, request.Variants, request.BasePrice);
        }

        // 🔹 Xóa product
        public async Task DeleteAsync(int id)
        {
            var product = await _repo.GetByIdAsync(id);

            if (product == null)
                throw new Exception("Product not found");

            _repo.Delete(product);
            await _repo.SaveChangesAsync();
        }

        // 🔹 Helper: lưu variants + size/color lookup + inventory
        private async Task SaveVariantsAsync(int productId, List<ProductVariantRequest> variants, decimal basePrice)
        {
            foreach (var vr in variants)
            {
                var sizeName = vr.Size?.Trim();
                var colorName = vr.Color?.Trim();

                var size = await _db.Sizes.FirstOrDefaultAsync(s => s.SizeName == sizeName);
                if (size == null)
                {
                    size = new Size { SizeName = sizeName };
                    _db.Sizes.Add(size);
                    await _db.SaveChangesAsync();
                }

                var color = await _db.Colors.FirstOrDefaultAsync(c => c.ColorName == colorName);
                if (color == null)
                {
                    color = new Color { ColorName = colorName };
                    _db.Colors.Add(color);
                    await _db.SaveChangesAsync();
                }

                var variant = new ProductVariant
                {
                    ProductId = productId,
                    SizeId = size.SizeId,
                    ColorId = color.ColorId,
                    Price = vr.Price ?? basePrice,
                    Sku = vr.Sku,
                    CreatedAt = DateTime.Now
                };
                _db.ProductVariants.Add(variant);
                await _db.SaveChangesAsync();

                _db.Inventories.Add(new Inventory
                {
                    VariantId = variant.VariantId,
                    Quantity = vr.Stock,
                    LastUpdated = DateTime.Now
                });
                await _db.SaveChangesAsync();
            }
        }

        // 🔹 Toggle trạng thái active/inactive
        public async Task ToggleStatusAsync(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) throw new Exception("Product not found");
            product.Status = product.Status == "inactive" ? "active" : "inactive";
            _repo.Update(product);
            await _repo.SaveChangesAsync();
        }

        // 🔹 Thêm ảnh URL cho sản phẩm
        public async Task<string> AddImageUrlAsync(int productId, string imageUrl)
        {
            var product = await _repo.GetByIdAsync(productId);
            if (product == null) throw new Exception("Product not found");
            product.ProductImages.Add(new DataLayer.Models.ProductImage
            {
                ProductId = productId,
                ImageUrl = imageUrl,
                IsPrimary = !product.ProductImages.Any(),
                CreatedAt = DateTime.Now
            });
            _repo.Update(product);
            await _repo.SaveChangesAsync();
            return imageUrl;
        }

        // 🔹 Lấy danh sách product nổi bật (featured)
        public async Task<List<ProductResponse>> GetFeaturedAsync(string? filter, int take = 12, CancellationToken cancellationToken = default)
        {
            var products = await _repo.GetFeaturedAsync(filter ?? string.Empty, take, cancellationToken);

            return products.Select(p =>
            {
                var firstVariant = p.ProductVariants.FirstOrDefault();
                var imageUrl = p.ProductImages.FirstOrDefault()?.ImageUrl;
                var totalStock = p.ProductVariants
                    .SelectMany(v => v.Inventories)
                    .Sum(i => i.Quantity ?? 0);

                return new ProductResponse
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    CategoryName = p.Category?.CategoryName,
                    Thumbnail = imageUrl,
                    ImageUrl = imageUrl,
                    Sku = firstVariant?.Sku,
                    Price = firstVariant?.Price ?? 0,
                    BasePrice = firstVariant?.Price ?? 0,
                    TotalStock = totalStock,
                    IsActive = p.Status == "active" || p.Status == null,
                    Variants = p.ProductVariants.Select(v => new ProductVariantDto
                    {
                        VariantId = v.VariantId,
                        Sku = v.Sku,
                        Size = v.Size?.SizeName ?? string.Empty,
                        Color = v.Color?.ColorName ?? string.Empty,
                        Price = v.Price ?? 0,
                        Stock = v.Inventories.Sum(i => i.Quantity ?? 0)
                    }).ToList()
                };
            }).ToList();
        }
    }
}
