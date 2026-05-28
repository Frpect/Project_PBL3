using System.Security.Cryptography;
using System.Text;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Respository;
using Project.ExceptionHandling;

namespace Project.ApplicationLogic.Service
{
    public class CustomerService : ICustomerService
    {
        private readonly IUserRepository _userRepo;

        public CustomerService(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public CustomerResponse GetCustomerById(int id)
        {
            var user = _userRepo.GetById(id);
            if (user == null)
                throw new NotFoundException("Customer not found");

            return MapToCustomerResponse(user);
        }

        public CustomerResponse ToggleStatus(int id)
        {
            var user = _userRepo.GetById(id);
            if (user == null)
                throw new NotFoundException("Customer not found");

            user.Status = user.Status == "active" ? "locked" : "active";
            _userRepo.Save();

            return MapToCustomerResponse(user);
        }

        public List<CustomerResponse> SearchCustomers(string? query)
        {
            var users = _userRepo.GetCustomers(query);

            return users.Select(u => MapToCustomerResponse(u)).ToList();
        }

        public List<OrderResponse> GetCustomerOrders(int id)
        {
            var user = _userRepo.GetByIdWithOrders(id);
            if (user == null)
                throw new NotFoundException("Customer not found");

            return user.Orders
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderResponse
                {
                    OrderId = o.OrderId,
                    OrderStatus = o.OrderStatus ?? string.Empty,
                    TotalAmount = o.TotalAmount ?? 0,
                    DiscountAmount = o.DiscountAmount ?? 0,
                    FinalAmount = (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0),
                    OrderDate = o.OrderDate ?? DateTime.MinValue,
                    ShippingAddress = FormatAddress(o.ShippingAddress),
                    Items = o.OrderDetails.Select(od => new OrderItemResponse
                    {
                        VariantId = od.VariantId ?? 0,
                        ProductName = od.Variant?.Product?.ProductName ?? string.Empty,
                        Size = od.Variant?.Size?.SizeName ?? string.Empty,
                        Color = od.Variant?.Color?.ColorName ?? string.Empty,
                        Price = od.Price ?? 0,
                        Quantity = od.Quantity ?? 0
                    }).ToList()
                }).ToList();
        }

        public List<AddressResponse> GetCustomerAddresses(int id)
        {
            var user = _userRepo.GetByIdWithAddresses(id);
            if (user == null)
                throw new NotFoundException("Customer not found");

            return user.Addresses.Select(a => new AddressResponse
            {
                AddressId = a.AddressId,
                RecipientName = a.RecipientName ?? string.Empty,
                Phone = a.Phone ?? string.Empty,
                Province = a.Province ?? string.Empty,
                District = a.District ?? string.Empty,
                Ward = a.Ward ?? string.Empty,
                StreetAddress = a.StreetAddress ?? string.Empty,
                AddressType = a.AddressType ?? "home",
                IsDefault = a.IsDefault ?? false
            }).ToList();
        }

        public CustomerResponse UpdateCustomer(UpdateCustomerRequest request)
        {
            var user = _userRepo.GetById(request.UserId);
            if (user == null)
                throw new NotFoundException("Customer not found");

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;
            if (request.Status != null)
                user.Status = request.Status;

            _userRepo.Save();

            return MapToCustomerResponse(user);
        }

        public AddressResponse AddAddress(int userId, AddressUpsertRequest request)
        {
            var user = _userRepo.GetByIdWithAddresses(userId);
            if (user == null)
                throw new NotFoundException("Customer not found");

            if (request.IsDefault)
                foreach (var a in user.Addresses)
                    a.IsDefault = false;

            var addr = new Address
            {
                UserId = userId,
                RecipientName = request.RecipientName,
                Phone = request.Phone,
                Province = request.Province,
                District = request.District,
                Ward = request.Ward,
                StreetAddress = request.StreetAddress,
                AddressType = string.IsNullOrWhiteSpace(request.AddressType) ? "home" : request.AddressType,
                IsDefault = request.IsDefault
            };

            _userRepo.AddAddress(addr);
            _userRepo.Save();

            return MapAddress(addr);
        }

        public AddressResponse UpdateAddress(int userId, int addressId, AddressUpsertRequest request)
        {
            var user = _userRepo.GetByIdWithAddresses(userId);
            if (user == null)
                throw new NotFoundException("Customer not found");

            var addr = _userRepo.GetAddressForUser(addressId, userId);
            if (addr == null)
                throw new NotFoundException("Address not found");

            if (request.IsDefault)
                foreach (var a in user.Addresses)
                    a.IsDefault = false;

            addr.RecipientName = request.RecipientName;
            addr.Phone = request.Phone;
            addr.Province = request.Province;
            addr.District = request.District;
            addr.Ward = request.Ward;
            addr.StreetAddress = request.StreetAddress;
            addr.AddressType = string.IsNullOrWhiteSpace(request.AddressType) ? "home" : request.AddressType;
            addr.IsDefault = request.IsDefault;

            _userRepo.Save();
            return MapAddress(addr);
        }

        public void DeleteAddress(int userId, int addressId)
        {
            var addr = _userRepo.GetAddressForUser(addressId, userId);
            if (addr == null)
                throw new NotFoundException("Address not found");

            _userRepo.RemoveAddress(addr);
            _userRepo.Save();
        }

        public void ResetPassword(int userId, string newPassword)
        {
            var user = _userRepo.GetById(userId);
            if (user == null) throw new NotFoundException("Customer not found");
            using var sha256 = SHA256.Create();
            user.PasswordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(newPassword)));
            _userRepo.Save();
        }

        private static AddressResponse MapAddress(Address a) => new()
        {
            AddressId = a.AddressId,
            RecipientName = a.RecipientName ?? string.Empty,
            Phone = a.Phone ?? string.Empty,
            Province = a.Province ?? string.Empty,
            District = a.District ?? string.Empty,
            Ward = a.Ward ?? string.Empty,
            StreetAddress = a.StreetAddress ?? string.Empty,
            AddressType = a.AddressType ?? "home",
            IsDefault = a.IsDefault ?? false
        };

        private static CustomerResponse MapToCustomerResponse(DataLayer.Models.User user)
        {
            var orders = user.Orders ?? new List<DataLayer.Models.Order>();
            var completedOrders = orders.Where(o => o.OrderStatus != "cancelled").ToList();
            return new CustomerResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                Status = user.Status ?? "active",
                CreatedAt = user.CreatedAt,
                TotalOrders = orders.Count,
                TotalSpent = completedOrders.Sum(o => (o.TotalAmount ?? 0) - (o.DiscountAmount ?? 0))
            };
        }

        private static string FormatAddress(DataLayer.Models.Address? addr)
        {
            if (addr == null) return string.Empty;
            var parts = new[] { addr.StreetAddress, addr.Ward, addr.District, addr.Province }
                .Where(p => !string.IsNullOrWhiteSpace(p));
            return string.Join(", ", parts);
        }
    }
}
