using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IProductService
    {
        Task<List<ProductResponse>> GetAllAsync(string? search = null);
        Task<List<ProductResponse>> GetFeaturedAsync(string? filter, int take = 12, CancellationToken cancellationToken = default);
        Task<ProductDetailResponse> GetByIdAsync(int id);

        Task CreateAsync(ProductRequest request);
        Task UpdateAsync(int id, ProductRequest request);
        Task DeleteAsync(int id);
    }
}
