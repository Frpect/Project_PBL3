namespace Project.ApplicationLogic.DTOs
{
    public class VariantRequest
    {
        public int SizeId { get; set; }
        public int ColorId { get; set; }
        public decimal Price { get; set; }
        public string? Sku { get; set; }
        public int InitialStock { get; set; } = 0;
    }

    public class VariantUpdateRequest
    {
        public decimal? Price { get; set; }
        public string? Sku { get; set; }
        public int? Stock { get; set; }
    }
}
