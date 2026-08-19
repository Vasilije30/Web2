using System.Security.Claims;
using TripPlanning.Service.Dtos;

namespace TripPlanning.Service.Services;

public interface IExpenseService
{
    Task<List<ExpenseDto>> GetExpensesAsync(Guid tripId, ClaimsPrincipal user, string? shareToken);
    Task<ExpenseDto> GetExpenseByIdAsync(Guid tripId, Guid expenseId, ClaimsPrincipal user, string? shareToken);
    Task<ExpenseDto> CreateExpenseAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, ExpenseRequest request);
    Task<ExpenseDto> UpdateExpenseAsync(Guid tripId, Guid expenseId, ClaimsPrincipal user, string? shareToken, ExpenseRequest request);
    Task DeleteExpenseAsync(Guid tripId, Guid expenseId, ClaimsPrincipal user, string? shareToken);
    Task<BudgetSummaryDto> GetBudgetSummaryAsync(Guid tripId, ClaimsPrincipal user, string? shareToken);
}
