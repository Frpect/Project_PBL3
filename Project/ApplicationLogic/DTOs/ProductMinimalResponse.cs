namespace Project.ApplicationLogic.DTOs
{
    public class ProductMinimalResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public List<VariantMinimalResponse> Variants { get; set; }
    }

    public class VariantMinimalResponse
    {
        public int VariantId { get; set; }
        public string Sku { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
    }
}
