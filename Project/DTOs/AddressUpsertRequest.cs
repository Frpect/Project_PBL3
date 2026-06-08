using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs;

public class AddressUpsertRequest
{
    [Required(ErrorMessage = "Tên người nhận không được để trống")]
    public string RecipientName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Số điện thoại không được để trống")]
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tỉnh/Thành phố không được để trống")]
    public string Province { get; set; } = string.Empty;

    [Required(ErrorMessage = "Quận/Huyện không được để trống")]
    public string District { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phường/Xã không được để trống")]
    public string Ward { get; set; } = string.Empty;

    [Required(ErrorMessage = "Địa chỉ chi tiết không được để trống")]
    public string StreetAddress { get; set; } = string.Empty;

    public string AddressType { get; set; } = "home";
    public bool IsDefault { get; set; }
}
