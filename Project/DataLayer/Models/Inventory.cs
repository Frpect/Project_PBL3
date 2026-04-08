namespace Project.DataLayer.Models
{
    public class Inventory
    {
        public int inventory_id { get; set; }
        public int variant_id { get; set; }
        public int quantity { get; set; }
        public DateTime last_updated { get; set; }

        public ProductVariant Variant { get; set; }
    }
}
