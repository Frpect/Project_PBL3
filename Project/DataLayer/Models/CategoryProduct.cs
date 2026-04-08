namespace Project.DataLayer.Models
{
    public class CategoryProduct
    {
        public int promotion_id { get; set; }
        public int category_id { get; set; }

        public Promotion Promotion { get; set; }
        public Category Category { get; set; }
    }
}
