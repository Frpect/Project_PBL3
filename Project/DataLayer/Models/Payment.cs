namespace Project.DataLayer.Models
{
    public class Payment
    {
        public int payment_id { get; set; }
        public int order_id { get; set; }
        public string payment_method { get; set; }
        public string payment_status { get; set; }
        public DateTime payment_date { get; set; }

        public Orders Order { get; set; }
    }
}
