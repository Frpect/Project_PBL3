using Project.DataLayer.Models;

namespace Project.DataLayer.Respository;

public interface IPromotionRepository
{
    Task<List<Promotion>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Promotion?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task AddAsync(Promotion promotion, CancellationToken cancellationToken = default);
    void Update(Promotion promotion);
    void Remove(Promotion promotion);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<bool> IsReferencedByOrdersAsync(int promotionId, CancellationToken cancellationToken = default);
}
