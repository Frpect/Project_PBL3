namespace Project.ApplicationLogic.DTOs;

public class DiscountDto
{
    public int DiscountId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateDiscountRequest
{
    /// <summary>Mã nhập ở checkout (ví dụ SUMMER20). Lưu vào promotion_name.</summary>
    public string Code { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string DiscountType { get; set; } = "percent";
    public decimal DiscountValue { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "active";
}

public class UpdateDiscountRequest : CreateDiscountRequest
{
}

public class ValidateDiscountRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal CartSubTotal { get; set; }
}

public class ValidateDiscountResponse
{
    public bool Valid { get; set; }
    public string Message { get; set; } = string.Empty;
    public int? PromotionId { get; set; }
    public string? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public decimal? DiscountAmount { get; set; }
}
