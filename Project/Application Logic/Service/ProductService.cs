using TestCautruc.DataLayer.Models;
using TestCautruc.DataLayer.Respository;

namespace TestCautruc.Application_Logic.Service
{
    public class ProductService
    {
        private readonly ProductRepository _repo = new ProductRepository();

        public List<Product> GetAll()
        {
            return _repo.GetAll();
        }
    }
}
