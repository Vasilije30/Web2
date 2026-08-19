namespace TripPlanning.Service.Dtos;

public class ExpenseDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
}
