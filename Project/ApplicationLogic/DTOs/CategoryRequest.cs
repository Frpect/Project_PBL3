namespace Project.ApplicationLogic.DTOs
{
    public class CategoryRequest
    {
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
        public int? ParentId { get; set; }
        public bool? IsVisible { get; set; }
    }
}
