using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IInventoryService
    {
        Task<List<InventoryResponse>> GetAllAsync(string? query);
        Task<List<InventoryTransactionResponse>> GetHistoryAsync();
        Task<List<ProductMinimalResponse>> GetProductsMinimalAsync();
        Task<InventoryTransactionResponse> CreateTransactionAsync(InventoryTransactionRequest request);
        List<string> GetReasons(InventoryTransactionType? type);
        Dictionary<string, List<string>> GetAllReasonsByType();
    }
}
