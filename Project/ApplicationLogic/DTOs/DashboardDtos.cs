namespace Project.ApplicationLogic.DTOs;

public class DashboardSummaryDto
{
    public decimal TodayRevenue { get; set; }
    public int TodayOrders { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalProducts { get; set; }
    public decimal MonthRevenue { get; set; }
    public int MonthOrders { get; set; }
}

public class DashboardStatsComparisonDto
{
    public decimal ThisWeekRevenue { get; set; }
    public int ThisWeekOrders { get; set; }
    public decimal LastWeekRevenue { get; set; }
    public int LastWeekOrders { get; set; }
}

public class LowStockProductDto
{
    public int VariantId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public int QuantityOnHand { get; set; }
}

public class RevenuePointDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class OrderStatusSliceDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public class OrderListItemDto
{
    public int OrderId { get; set; }
    public int? UserId { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public DateTime OrderDate { get; set; }
}
