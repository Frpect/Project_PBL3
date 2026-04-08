namespace Project.DataLayer.Models
{
    public class Cart
    {
        public int cart_id { get; set; }
        public int user_id { get; set; }
        public DateTime created_at { get; set; }

        public User User { get; set; }
        public List<CartItem> Items { get; set; }
    }
}
