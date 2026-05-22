namespace Project.ApplicationLogic.DTOs
{
    public class FilterOptionsResponse
    {
        public List<ColorOption> Colors { get; set; } = new();
        public List<SizeOption> Sizes { get; set; } = new();
        public List<CategoryOption> Categories { get; set; } = new();
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
    }

    public class ColorOption
    {
        public int ColorId { get; set; }
        public string ColorName { get; set; } = string.Empty;
    }

    public class SizeOption
    {
        public int SizeId { get; set; }
        public string SizeName { get; set; } = string.Empty;
    }

    public class CategoryOption
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
