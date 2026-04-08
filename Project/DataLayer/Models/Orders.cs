namespace Project.DataLayer.Models
{
    public class Orders
    {
        public int order_id { get; set; }
        public int user_id { get; set; }
        public int? promotion_id { get; set; }
        public decimal total_amount { get; set; }
        public decimal discount_amount { get; set; }
        public string order_status { get; set; }
        public DateTime order_date { get; set; }
        public string shipping_address { get; set; }

        public User User { get; set; }
        public List<OrderDetail> Details { get; set; }
    }
    public class OrderDetail
    {
        public int order_detail_id { get; set; }
        public int order_id { get; set; }
        public int variant_id { get; set; }
        public int quantity { get; set; }
        public decimal price { get; set; }

        public Orders Order { get; set; }
        public ProductVariant Variant { get; set; }
    }
}
