using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service;

public interface IPaymentService
{
    Task<CreatePaymentUrlResponse> CreatePaymentUrlAsync(CreatePaymentUrlRequest request, CancellationToken cancellationToken = default);
}
