using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Respository;

namespace Project.ApplicationLogic.Service
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;

        public ProductService(IProductRepository repo)
        {
            _repo = repo;
        }

        // 🔹 Lấy danh sách product (gọn)
        public async Task<List<ProductResponse>> GetAllAsync()
        {
            var products = await _repo.GetAllAsync();

            return products.Select(p => new ProductResponse
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                CategoryName = p.Category?.CategoryName,

                Thumbnail = p.ProductImages.FirstOrDefault()?.ImageUrl,
                Price = p.ProductVariants.FirstOrDefault()?.Price ?? 0
            }).ToList();
        }

        // 🔹 Lấy chi tiết product
        public async Task<ProductDetailResponse> GetByIdAsync(int id)
        {
            var p = await _repo.GetByIdAsync(id);

            if (p == null)
                throw new Exception("Product not found");

            return new ProductDetailResponse
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Description = p.Description,
                CategoryName = p.Category?.CategoryName,

                Price = p.ProductVariants.FirstOrDefault()?.Price ?? 0,

                Images = p.ProductImages
            .Select(i => i.ImageUrl)
            .ToList(),

                Sizes = p.ProductVariants
            .Select(v => v.Size?.SizeName)
            .Where(s => s != null)
            .Distinct()
            .ToList(),

                Colors = p.ProductVariants
            .Select(v => v.Color?.ColorName)
            .Where(c => c != null)
            .Distinct()
            .ToList(),



                Variants = p.ProductVariants.Select(v => new ProductVariantDto
                {
                    VariantId = v.VariantId,
                    Size = v.Size?.SizeName ?? string.Empty,
                    Color = v.Color?.ColorName ?? string.Empty,
                    Price = v.Price ?? 0

                }).ToList()
            };
        }

        // 🔹 Tạo product
        public async Task CreateAsync(ProductRequest request)
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
            };

            await _repo.AddAsync(product);
            await _repo.SaveChangesAsync();
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

            _repo.Update(product);
            await _repo.SaveChangesAsync();
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
    }
}
