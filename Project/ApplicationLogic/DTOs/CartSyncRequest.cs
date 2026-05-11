namespace Project.ApplicationLogic.DTOs;

public class CartSyncRequest
{
    public int UserId { get; set; }
    public List<CartSyncLineDto> Items { get; set; } = new();
}

public class CartSyncLineDto
{
    public int VariantId { get; set; }
    public int Quantity { get; set; }
}
