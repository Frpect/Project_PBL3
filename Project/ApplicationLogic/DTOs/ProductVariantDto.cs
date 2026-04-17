namespace Project.ApplicationLogic.DTOs
{
    public class ProductVariantDto
    {
        public int VariantId { get; set; }

        public string Size { get; set; }
        public string Color { get; set; }

        public decimal Price { get; set; }
        public int Stock { get; set; }
    }
}
