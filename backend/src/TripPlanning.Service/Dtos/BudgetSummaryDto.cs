namespace TripPlanning.Service.Dtos;

public class BudgetSummaryDto
{
    public decimal Budget { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal RemainingBudget { get; set; }
}
