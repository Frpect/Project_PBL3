using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service;

public interface IDiscountService
{
    Task<List<DiscountDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<DiscountDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<DiscountDto> CreateAsync(CreateDiscountRequest request, CancellationToken cancellationToken = default);
    Task<DiscountDto> UpdateAsync(int id, UpdateDiscountRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<ValidateDiscountResponse> ValidateAsync(ValidateDiscountRequest request, CancellationToken cancellationToken = default);
}
