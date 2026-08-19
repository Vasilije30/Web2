using TripPlanning.Service.Models;

namespace TripPlanning.Service.Dtos;

public static class ExpenseMappingExtensions
{
    public static ExpenseDto ToDto(this Expense expense) => new()
    {
        Id = expense.Id,
        TripId = expense.TripId,
        Name = expense.Name,
        Category = expense.Category.ToString(),
        Amount = expense.Amount,
        Date = expense.Date,
        Description = expense.Description,
    };

    public static void ApplyTo(this ExpenseRequest request, Expense expense)
    {
        expense.Name = request.Name;
        expense.Category = request.Category;
        expense.Amount = request.Amount;
        expense.Date = request.Date;
        expense.Description = request.Description;
    }
}
