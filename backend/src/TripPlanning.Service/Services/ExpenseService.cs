using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Shared.Exceptions;
using TripPlanning.Service.Data;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Services;

public class ExpenseService : IExpenseService
{
    private readonly TripPlanningDbContext _dbContext;
    private readonly ITripAccessGuard _accessGuard;

    public ExpenseService(TripPlanningDbContext dbContext, ITripAccessGuard accessGuard)
    {
        _dbContext = dbContext;
        _accessGuard = accessGuard;
    }

    public async Task<List<ExpenseDto>> GetExpensesAsync(Guid tripId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);

        var expenses = await _dbContext.Expenses
            .Where(e => e.TripId == tripId)
            .OrderByDescending(e => e.Date)
            .ToListAsync();

        return expenses.Select(e => e.ToDto()).ToList();
    }

    public async Task<ExpenseDto> GetExpenseByIdAsync(Guid tripId, Guid expenseId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);
        var expense = await GetExpenseInTripAsync(tripId, expenseId);
        return expense.ToDto();
    }

    public async Task<ExpenseDto> CreateExpenseAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, ExpenseRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            Name = request.Name,
        };
        request.ApplyTo(expense);

        _dbContext.Expenses.Add(expense);
        await _dbContext.SaveChangesAsync();

        return expense.ToDto();
    }

    public async Task<ExpenseDto> UpdateExpenseAsync(Guid tripId, Guid expenseId, ClaimsPrincipal user, string? shareToken, ExpenseRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var expense = await GetExpenseInTripAsync(tripId, expenseId);

        request.ApplyTo(expense);
        await _dbContext.SaveChangesAsync();

        return expense.ToDto();
    }

    public async Task DeleteExpenseAsync(Guid tripId, Guid expenseId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var expense = await GetExpenseInTripAsync(tripId, expenseId);

        _dbContext.Expenses.Remove(expense);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(Guid tripId, ClaimsPrincipal user, string? shareToken)
    {
        var trip = await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);

        var totalSpent = await _dbContext.Expenses
            .Where(e => e.TripId == tripId)
            .SumAsync(e => (decimal?)e.Amount) ?? 0m;

        return new BudgetSummaryDto
        {
            Budget = trip.Budget,
            TotalSpent = totalSpent,
            RemainingBudget = trip.Budget - totalSpent,
        };
    }

    private async Task<Expense> GetExpenseInTripAsync(Guid tripId, Guid expenseId)
    {
        return await _dbContext.Expenses.FirstOrDefaultAsync(e => e.Id == expenseId && e.TripId == tripId)
            ?? throw new NotFoundException($"Trošak '{expenseId}' nije pronađen za plan '{tripId}'.");
    }
}
