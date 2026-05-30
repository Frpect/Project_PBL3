using System.ComponentModel.DataAnnotations;

namespace Project.ApplicationLogic.DTOs
{
    public class InventoryTransactionRequest
    {
        [Required]
        public int VariantId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public InventoryTransactionType Type { get; set; }

        public string? Note { get; set; }
    }
}
