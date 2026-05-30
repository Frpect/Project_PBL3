namespace Project.ApplicationLogic.DTOs
{
    public class AddressResponse
    {
        public int AddressId { get; set; }
        public string RecipientName { get; set; }
        public string Phone { get; set; }
        public string Province { get; set; }
        public string District { get; set; }
        public string Ward { get; set; }
        public string StreetAddress { get; set; }
        public string AddressType { get; set; }
        public bool IsDefault { get; set; }
    }
}
