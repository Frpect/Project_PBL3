using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface ICustomerService
{
    Task<CustomerResponse> GetCustomerByIdAsync(int id);
    Task<CustomerResponse> ToggleStatusAsync(int id);
    Task<List<CustomerResponse>> SearchCustomersAsync(string? query);
    Task<List<OrderResponse>> GetCustomerOrdersAsync(int id);
    Task<List<AddressResponse>> GetCustomerAddressesAsync(int id);
    Task<AddressResponse> AddAddressAsync(int userId, AddressUpsertRequest request);
    Task<AddressResponse> UpdateAddressAsync(int userId, int addressId, AddressUpsertRequest request);
    Task DeleteAddressAsync(int userId, int addressId);
    Task<CustomerResponse> UpdateCustomerAsync(UpdateCustomerRequest request);
    Task ResetPasswordAsync(int userId, string newPassword);
}
}
