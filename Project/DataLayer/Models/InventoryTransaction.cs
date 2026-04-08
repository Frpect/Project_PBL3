namespace Project.DataLayer.Models
{
    public class InventoryTransaction
    {
        public int transaction_id { get; set; }
        public int variant_id { get; set; }
        public int quantity { get; set; }
        public DateTime created_at { get; set; }
        public string type { get; set; } // import / export
        public string note { get; set; }

        public ProductVariant Variant { get; set; }
    }
}
