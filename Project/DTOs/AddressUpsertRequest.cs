namespace Project.ApplicationLogic.DTOs;

public class AddressUpsertRequest
{
    public string RecipientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string StreetAddress { get; set; } = string.Empty;
    public string AddressType { get; set; } = "home";
    public bool IsDefault { get; set; }
}
