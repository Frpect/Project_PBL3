using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IOrderService
    {
        Task<OrderResponse> PlaceOrderAsync(PlaceOrderRequest request);
        Task<OrderResponse> GetOrderAsync(int orderId);
        Task<List<OrderResponse>> GetOrdersByUserAsync(int userId);
        Task CancelOrderAsync(int orderId);
    }
}
