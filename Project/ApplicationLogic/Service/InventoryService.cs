using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Respository;

namespace Project.ApplicationLogic.Service
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _repo;

        public InventoryService(IInventoryRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<InventoryResponse>> GetAllAsync(string? query)
        {
            var items = await _repo.GetAllAsync(query);

            return items.Select(i => new InventoryResponse
            {
                InventoryId = i.InventoryId,
                VariantId = i.VariantId ?? 0,
                ProductName = i.Variant?.Product?.ProductName ?? string.Empty,
                Sku = i.Variant?.Sku ?? string.Empty,
                Size = i.Variant?.Size?.SizeName ?? string.Empty,
                Color = i.Variant?.Color?.ColorName ?? string.Empty,
                Quantity = i.Quantity ?? 0,
                LastUpdated = i.LastUpdated
            }).ToList();
        }

        public async Task<List<InventoryTransactionResponse>> GetHistoryAsync()
        {
            var transactions = await _repo.GetHistoryAsync();

            return transactions.Select(t => new InventoryTransactionResponse
            {
                TransactionId = t.TransactionId,
                VariantId = t.VariantId ?? 0,
                ProductName = t.Variant?.Product?.ProductName ?? string.Empty,
                Sku = t.Variant?.Sku ?? string.Empty,
                Quantity = t.Quantity ?? 0,
                Type = t.Type ?? string.Empty,
                Note = t.Note ?? string.Empty,
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<List<ProductMinimalResponse>> GetProductsMinimalAsync()
        {
            var products = await _repo.GetProductsWithVariantsAsync();

            return products.Select(p => new ProductMinimalResponse
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName ?? string.Empty,
                Variants = p.ProductVariants.Select(v => new VariantMinimalResponse
                {
                    VariantId = v.VariantId,
                    Sku = v.Sku ?? string.Empty,
                    Size = v.Size?.SizeName ?? string.Empty,
                    Color = v.Color?.ColorName ?? string.Empty
                }).ToList()
            }).ToList();
        }

        public async Task<InventoryTransactionResponse> CreateTransactionAsync(InventoryTransactionRequest request)
        {
            var inventory = await _repo.GetByVariantIdAsync(request.VariantId);
            if (inventory == null)
                throw new Exception("Inventory not found for this variant");

            // Update inventory quantity
            inventory.Quantity = (inventory.Quantity ?? 0) + request.Quantity;
            inventory.LastUpdated = DateTime.Now;

            // Create transaction record
            var transaction = new InventoryTransaction
            {
                VariantId = request.VariantId,
                Quantity = request.Quantity,
                Type = request.Type.ToString(),
                Note = request.Note,
                CreatedAt = DateTime.Now
            };

            await _repo.AddTransactionAsync(transaction);
            await _repo.SaveChangesAsync();

            return new InventoryTransactionResponse
            {
                TransactionId = transaction.TransactionId,
                VariantId = transaction.VariantId ?? 0,
                ProductName = inventory.Variant?.Product?.ProductName ?? string.Empty,
                Sku = inventory.Variant?.Sku ?? string.Empty,
                Quantity = transaction.Quantity ?? 0,
                Type = transaction.Type ?? string.Empty,
                Note = transaction.Note ?? string.Empty,
                CreatedAt = transaction.CreatedAt
            };
        }

        public List<string> GetReasons(InventoryTransactionType? type)
        {
            if (type == null) return new List<string>();
            
            return type switch
            {
                InventoryTransactionType.Import => new List<string> 
                { 
                    "Nhập hàng mới từ NCC",
                    "Nhập trả lại từ khách hàng",
                    "Nhập điều chuyển từ chi nhánh khác",
                    "Nhập bù điều chỉnh" 
                },
                InventoryTransactionType.Export => new List<string>
                {
                    "Xuất trả nhà cung cấp",
                    "Xuất điều chuyển chi nhánh",
                    "Xuất hàng mẫu",
                    "Xuất sử dụng nội bộ"
                },
                InventoryTransactionType.Adjustment => new List<string>
                {
                    "Kiểm kê thừa",
                    "Kiểm kê thiếu",
                    "Điều chỉnh sau kiểm kê",
                    "Điều chỉnh hàng lỗi/hư hỏng",
                    "Điều chỉnh hết hạn",
                    "Điều chỉnh khác"
                },
                _ => new List<string>()
            };
        }

        public Dictionary<string, List<string>> GetAllReasonsByType()
        {
            var result = new Dictionary<string, List<string>>();
            
            foreach (InventoryTransactionType type in Enum.GetValues(typeof(InventoryTransactionType)))
            {
                result[type.ToString()] = GetReasons(type);
            }
            
            return result;
        }
    }
}
