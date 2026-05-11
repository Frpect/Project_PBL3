using Microsoft.EntityFrameworkCore;
using Project.DataLayer.Context;
using Project.DataLayer.Models;

namespace Project.DataLayer.Respository;

public class PromotionRepository : IPromotionRepository
{
    private readonly AppDbContext _db;

    public PromotionRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Promotion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Promotions.AsNoTracking().OrderByDescending(p => p.StartDate).ToListAsync(cancellationToken);
    }

    public async Task<Promotion?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _db.Promotions.FirstOrDefaultAsync(p => p.PromotionId == id, cancellationToken);
    }

    public async Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = code.Trim();
        return await _db.Promotions
            .FirstOrDefaultAsync(p => p.PromotionName != null && p.PromotionName.ToLower() == normalized.ToLower(), cancellationToken);
    }

    public async Task AddAsync(Promotion promotion, CancellationToken cancellationToken = default)
    {
        await _db.Promotions.AddAsync(promotion, cancellationToken);
    }

    public void Update(Promotion promotion)
    {
        _db.Promotions.Update(promotion);
    }

    public void Remove(Promotion promotion)
    {
        _db.Promotions.Remove(promotion);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> IsReferencedByOrdersAsync(int promotionId, CancellationToken cancellationToken = default)
    {
        return await _db.Orders.AnyAsync(o => o.PromotionId == promotionId, cancellationToken);
    }
}
