namespace Project.ApplicationLogic.DTOs
{
    public class AddImageUrlRequest
    {
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsPrimary { get; set; } = false;
    }
}
