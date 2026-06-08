using System.Security.Cryptography;
using System.Text;
using Project.ApplicationLogic.DTOs;
using Project.DataLayer.Models;
using Project.DataLayer.Repository;
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

        public async Task<CustomerResponse> GetCustomerByIdAsync(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                throw new NotFoundException("Customer not found");

            return MapToCustomerResponse(user);
        }

        public async Task<CustomerResponse> ToggleStatusAsync(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                throw new NotFoundException("Customer not found");

            user.Status = user.Status == "active" ? "locked" : "active";
            await _userRepo.SaveAsync();

            return MapToCustomerResponse(user);
        }

        public async Task<List<CustomerResponse>> SearchCustomersAsync(string? query)
        {
            var users = await _userRepo.GetCustomersAsync(query);

            return users.Select(u => MapToCustomerResponse(u)).ToList();
        }

        public async Task<List<OrderResponse>> GetCustomerOrdersAsync(int id)
        {
            var user = await _userRepo.GetByIdWithOrdersAsync(id);
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

        public async Task<List<AddressResponse>> GetCustomerAddressesAsync(int id)
        {
            var user = await _userRepo.GetByIdWithAddressesAsync(id);
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

        public async Task<CustomerResponse> UpdateCustomerAsync(UpdateCustomerRequest request)
        {
            var user = await _userRepo.GetByIdAsync(request.UserId);
            if (user == null)
                throw new NotFoundException("Customer not found");

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;
            if (request.Status != null)
                user.Status = request.Status;

            await _userRepo.SaveAsync();

            return MapToCustomerResponse(user);
        }

        public async Task<AddressResponse> AddAddressAsync(int userId, AddressUpsertRequest request)
        {
            var user = await _userRepo.GetByIdWithAddressesAsync(userId);
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

            await _userRepo.AddAddressAsync(addr);
            await _userRepo.SaveAsync();

            return MapAddress(addr);
        }

        public async Task<AddressResponse> UpdateAddressAsync(int userId, int addressId, AddressUpsertRequest request)
        {
            var user = await _userRepo.GetByIdWithAddressesAsync(userId);
            if (user == null)
                throw new NotFoundException("Customer not found");

            var addr = await _userRepo.GetAddressForUserAsync(addressId, userId);
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

            await _userRepo.SaveAsync();
            return MapAddress(addr);
        }

        public async Task DeleteAddressAsync(int userId, int addressId)
        {
            var addr = await _userRepo.GetAddressForUserAsync(addressId, userId);
            if (addr == null)
                throw new NotFoundException("Address not found");

            _userRepo.RemoveAddress(addr);
            await _userRepo.SaveAsync();
        }

        public async Task ResetPasswordAsync(int userId, string newPassword)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException("Customer not found");
            using var sha256 = SHA256.Create();
            user.PasswordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(newPassword)));
            await _userRepo.SaveAsync();
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
