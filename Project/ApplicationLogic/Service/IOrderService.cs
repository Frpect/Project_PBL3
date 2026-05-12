using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IOrderService
    {
        Task<OrderResponse> PlaceOrderAsync(PlaceOrderRequest request);
        Task<OrderResponse> GetOrderAsync(int orderId);
        Task<List<OrderResponse>> GetOrdersByUserAsync(int userId);
        Task<List<OrderResponse>> GetAllOrdersAsync();
        Task UpdateOrderStatusAsync(int orderId, string status);
        Task CancelOrderAsync(int orderId);
    }
}
