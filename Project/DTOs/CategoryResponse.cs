namespace Project.ApplicationLogic.DTOs
{
    public class CategoryResponse
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public bool IsVisible { get; set; } = true;
    }
}
