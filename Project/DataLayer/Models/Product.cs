using Project.DataLayer.Models;

namespace TestCautruc.DataLayer.Models
{
    public class Product
    {
        public int product_id { get; set; }
        public int category_id { get; set; }
        public string product_name { get; set; }
        public string description { get; set; }
        public string status { get; set; }
        public DateTime created_at { get; set; }

        public Category Category { get; set; }
        public List<ProductVariant> Variants { get; set; }
    }    
}
