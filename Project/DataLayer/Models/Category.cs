using TestCautruc.DataLayer.Models;

namespace Project.DataLayer.Models
{
    public class Category
    {
        public int category_id { get; set; }
        public string category_name { get; set; }

        public List<Product> Products { get; set; }
    }
}
