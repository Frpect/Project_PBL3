using TestCautruc.DataLayer.Models;

namespace TestCautruc.DataLayer.Respository
{
    public class ProductRepository
    {
        private static List<Product> products = new List<Product>()
    {
        new Product { Id = 1, Name = "Áo thun" },
        new Product { Id = 2, Name = "Quần jean" }
    };

        public List<Product> GetAll()
        {
            return products;
        }
    }
}
