namespace Project.DataLayer.Models
{
    public class Promotion
    {
        public int promotion_id { get; set; }
        public string promotion_name { get; set; }
        public decimal discount_value { get; set; }
        public string discount_type { get; set; }

        public List<CategoryProduct> CategoryProducts { get; set; }
    }
}
