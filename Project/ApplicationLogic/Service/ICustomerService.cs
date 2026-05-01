using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface ICustomerService
    {
        CustomerResponse GetCustomerById(int id);
        CustomerResponse ToggleStatus(int id);
        List<CustomerResponse> SearchCustomers(string? query);
        List<OrderResponse> GetCustomerOrders(int id);
        List<AddressResponse> GetCustomerAddresses(int id);
        CustomerResponse UpdateCustomer(UpdateCustomerRequest request);
    }
}
