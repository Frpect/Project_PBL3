using Project.ApplicationLogic.DTOs;

namespace Project.ApplicationLogic.Service
{
    public interface IStaffService
    {
        Task<List<StaffResponse>> GetAllAsync();
        Task<StaffResponse> GetByIdAsync(int id);
        Task<StaffResponse> CreateAsync(CreateStaffRequest request);
        Task<StaffResponse> UpdateAsync(int id, UpdateStaffRequest request);
        Task<StaffResponse> ToggleLockAsync(int id);
        Task ResetPasswordAsync(int id, string newPassword);
        Task DeleteAsync(int id);
    }
}
