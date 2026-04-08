using TestCautruc.DataLayer.Models;

namespace Project.DataLayer.Models
{
    public class ProductImage
    {
        public int image_id { get; set; }
        public int product_id { get; set; }
        public string image_url { get; set; }
        public string is_primary { get; set; }

        public Product Product { get; set; }
    }
}
