using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.Service;
using Project.ApplicationLogic.DTOs;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "StaffOrAdmin")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomerController(ICustomerService service)
        {
            _service = service;
        }

        // GET /api/Customer/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetCustomerByIdAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PATCH /api/Customer/{id}/toggle-status
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var result = await _service.ToggleStatusAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PATCH /api/Customer/{id}/toggle-lock (alias)
        [HttpPatch("{id}/toggle-lock")]
        public async Task<IActionResult> ToggleLock(int id) => await ToggleStatus(id);

        // POST /api/Customer/{id}/reset-password
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _service.ResetPasswordAsync(id, request.NewPassword);
                return Ok(new { message = "Đã đặt lại mật khẩu" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET /api/Customer/search?query=
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? query)
        {
            var result = await _service.SearchCustomersAsync(query);
            return Ok(result);
        }

        // GET /api/Customer/{id}/orders
        [HttpGet("{id}/orders")]
        public async Task<IActionResult> GetOrders(int id)
        {
            try
            {
                var result = await _service.GetCustomerOrdersAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET /api/Customer/{id}/address
        [HttpGet("{id}/address")]
        public async Task<IActionResult> GetAddresses(int id)
        {
            try
            {
                var result = await _service.GetCustomerAddressesAsync(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST /api/Customer/{id}/address
        [HttpPost("{id}/address")]
        public async Task<IActionResult> AddAddress(int id, [FromBody] AddressUpsertRequest request)
        {
            try
            {
                var result = await _service.AddAddressAsync(id, request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT /api/Customer/{id}/address/{addressId}
        [HttpPut("{id}/address/{addressId}")]
        public async Task<IActionResult> UpdateAddress(int id, int addressId, [FromBody] AddressUpsertRequest request)
        {
            try
            {
                var result = await _service.UpdateAddressAsync(id, addressId, request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE /api/Customer/{id}/address/{addressId}
        [HttpDelete("{id}/address/{addressId}")]
        public async Task<IActionResult> DeleteAddress(int id, int addressId)
        {
            try
            {
                await _service.DeleteAddressAsync(id, addressId);
                return Ok(new { message = "Address removed" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT /api/Customer
        [HttpPut]
        public async Task<IActionResult> UpdateCustomer([FromBody] UpdateCustomerRequest request)
        {
            try
            {
                var result = await _service.UpdateCustomerAsync(request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
