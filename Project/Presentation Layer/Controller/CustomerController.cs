using Microsoft.AspNetCore.Mvc;
using Project.ApplicationLogic.Service;
using Project.ApplicationLogic.DTOs;
using Project.ExceptionHandling;

namespace Project.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomerController(ICustomerService service)
        {
            _service = service;
        }

        // GET /api/Customer/{id}
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                var result = _service.GetCustomerById(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PATCH /api/Customer/{id}/toggle-status
        [HttpPatch("{id}/toggle-status")]
        public IActionResult ToggleStatus(int id)
        {
            try
            {
                var result = _service.ToggleStatus(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET /api/Customer/search?query=
        [HttpGet("search")]
        public IActionResult Search([FromQuery] string? query)
        {
            var result = _service.SearchCustomers(query);
            return Ok(result);
        }

        // GET /api/Customer/{id}/orders
        [HttpGet("{id}/orders")]
        public IActionResult GetOrders(int id)
        {
            try
            {
                var result = _service.GetCustomerOrders(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET /api/Customer/{id}/address
        [HttpGet("{id}/address")]
        public IActionResult GetAddresses(int id)
        {
            try
            {
                var result = _service.GetCustomerAddresses(id);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST /api/Customer/{id}/address
        [HttpPost("{id}/address")]
        public IActionResult AddAddress(int id, [FromBody] AddressUpsertRequest request)
        {
            try
            {
                var result = _service.AddAddress(id, request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT /api/Customer/{id}/address/{addressId}
        [HttpPut("{id}/address/{addressId}")]
        public IActionResult UpdateAddress(int id, int addressId, [FromBody] AddressUpsertRequest request)
        {
            try
            {
                var result = _service.UpdateAddress(id, addressId, request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE /api/Customer/{id}/address/{addressId}
        [HttpDelete("{id}/address/{addressId}")]
        public IActionResult DeleteAddress(int id, int addressId)
        {
            try
            {
                _service.DeleteAddress(id, addressId);
                return Ok(new { message = "Address removed" });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT /api/Customer
        [HttpPut]
        public IActionResult UpdateCustomer([FromBody] UpdateCustomerRequest request)
        {
            try
            {
                var result = _service.UpdateCustomer(request);
                return Ok(result);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
