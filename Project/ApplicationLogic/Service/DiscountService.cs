using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Respository;
using Project.ExceptionHandling;

namespace Project.ApplicationLogic.Service;

public class DiscountService : IDiscountService
{
    private readonly IPromotionRepository _promotions;

    public DiscountService(IPromotionRepository promotions)
    {
        _promotions = promotions;
    }

    private static DiscountDto Map(Promotion p) => new()
    {
        DiscountId = p.PromotionId,
        Code = p.PromotionName ?? string.Empty,
        Name = p.PromotionName ?? string.Empty,
        DiscountType = p.DiscountType ?? "percent",
        DiscountValue = p.DiscountValue ?? 0,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        Status = p.Status ?? "active"
    };

    public async Task<List<DiscountDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var list = await _promotions.GetAllAsync(cancellationToken);
        return list.Select(Map).ToList();
    }

    public async Task<DiscountDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var p = await _promotions.GetByIdAsync(id, cancellationToken);
        if (p == null)
            throw new NotFoundException("Discount not found");
        return Map(p);
    }

    public async Task<DiscountDto> CreateAsync(CreateDiscountRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
            throw new Exception("Code is required");

        var dup = await _promotions.GetByCodeAsync(request.Code.Trim(), cancellationToken);
        if (dup != null)
            throw new Exception("A discount with this code already exists");

        var entity = new Promotion
        {
            PromotionName = request.Code.Trim(),
            DiscountType = string.IsNullOrWhiteSpace(request.DiscountType) ? "percent" : request.DiscountType.Trim(),
            DiscountValue = request.DiscountValue,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "active" : request.Status.Trim()
        };

        await _promotions.AddAsync(entity, cancellationToken);
        await _promotions.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<DiscountDto> UpdateAsync(int id, UpdateDiscountRequest request, CancellationToken cancellationToken = default)
    {
        var p = await _promotions.GetByIdAsync(id, cancellationToken);
        if (p == null)
            throw new NotFoundException("Discount not found");

        if (string.IsNullOrWhiteSpace(request.Code))
            throw new Exception("Code is required");

        var dup = await _promotions.GetByCodeAsync(request.Code.Trim(), cancellationToken);
        if (dup != null && dup.PromotionId != id)
            throw new Exception("A discount with this code already exists");

        p.PromotionName = request.Code.Trim();
        p.DiscountType = string.IsNullOrWhiteSpace(request.DiscountType) ? "percent" : request.DiscountType.Trim();
        p.DiscountValue = request.DiscountValue;
        p.StartDate = request.StartDate;
        p.EndDate = request.EndDate;
        p.Status = string.IsNullOrWhiteSpace(request.Status) ? "active" : request.Status.Trim();

        _promotions.Update(p);
        await _promotions.SaveChangesAsync(cancellationToken);
        return Map(p);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var p = await _promotions.GetByIdAsync(id, cancellationToken);
        if (p == null)
            throw new NotFoundException("Discount not found");

        if (await _promotions.IsReferencedByOrdersAsync(id, cancellationToken))
        {
            p.Status = "inactive";
            _promotions.Update(p);
            await _promotions.SaveChangesAsync(cancellationToken);
            return;
        }

        _promotions.Remove(p);
        await _promotions.SaveChangesAsync(cancellationToken);
    }

    public async Task<ValidateDiscountResponse> ValidateAsync(ValidateDiscountRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
            return new ValidateDiscountResponse { Valid = false, Message = "Code is required" };

        var p = await _promotions.GetByCodeAsync(request.Code, cancellationToken);
        if (p == null)
            return new ValidateDiscountResponse { Valid = false, Message = "Invalid code" };

        var now = DateTime.Now;
        if (p.Status != "active")
            return new ValidateDiscountResponse { Valid = false, Message = "This promotion is not active" };

        if (p.StartDate.HasValue && now < p.StartDate.Value)
            return new ValidateDiscountResponse { Valid = false, Message = "Promotion has not started yet" };

        if (p.EndDate.HasValue && now > p.EndDate.Value)
            return new ValidateDiscountResponse { Valid = false, Message = "Promotion has expired" };

        var type = p.DiscountType ?? "percent";
        decimal discountAmount = type == "percent"
            ? request.CartSubTotal * (p.DiscountValue ?? 0) / 100
            : (p.DiscountValue ?? 0);

        if (discountAmount < 0)
            discountAmount = 0;
        if (discountAmount > request.CartSubTotal)
            discountAmount = request.CartSubTotal;

        return new ValidateDiscountResponse
        {
            Valid = true,
            Message = "OK",
            PromotionId = p.PromotionId,
            DiscountType = type,
            DiscountValue = p.DiscountValue,
            DiscountAmount = discountAmount
        };
    }
}
