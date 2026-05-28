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
        AddressResponse AddAddress(int userId, AddressUpsertRequest request);
        AddressResponse UpdateAddress(int userId, int addressId, AddressUpsertRequest request);
        void DeleteAddress(int userId, int addressId);
        CustomerResponse UpdateCustomer(UpdateCustomerRequest request);
        void ResetPassword(int userId, string newPassword);
    }
}
