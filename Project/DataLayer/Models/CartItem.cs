namespace Project.DataLayer.Models
{
    public class CartItem
    {
        public int cart_item_id { get; set; }
        public int cart_id { get; set; }
        public int variant_id { get; set; }
        public int quantity { get; set; }
        public decimal price { get; set; }

        public Cart Cart { get; set; }
        public ProductVariant Variant { get; set; }
    }
}
