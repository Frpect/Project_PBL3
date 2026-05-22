namespace Project.ApplicationLogic.DTOs
{
    public class SearchSuggestionResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Thumbnail { get; set; }
        public decimal Price { get; set; }
    }
}
