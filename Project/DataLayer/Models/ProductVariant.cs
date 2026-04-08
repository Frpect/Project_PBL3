using TestCautruc.DataLayer.Models;

namespace Project.DataLayer.Models
{
    public class ProductVariant
    {
        public int variant_id { get; set; }
        public int product_id { get; set; }
        public string size { get; set; }
        public string color { get; set; }
        public decimal price { get; set; }

        public Product Product { get; set; }
        public Inventory Inventory { get; set; }
    }
}
