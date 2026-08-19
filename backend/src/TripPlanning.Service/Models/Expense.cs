namespace TripPlanning.Service.Models;

public enum ExpenseCategory
{
    Transport,
    Accommodation,
    Food,
    Tickets,
    Shopping,
    Other,
}

public class Expense
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public required string Name { get; set; }
    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;

    public Trip? Trip { get; set; }
}
