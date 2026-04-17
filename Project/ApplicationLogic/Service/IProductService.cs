using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IProductService
    {
        Task<List<ProductResponse>> GetAllAsync();
        Task<ProductDetailResponse> GetByIdAsync(int id);

        Task CreateAsync(ProductRequest request);
        Task UpdateAsync(int id, ProductRequest request);
        Task DeleteAsync(int id);
    }
}
