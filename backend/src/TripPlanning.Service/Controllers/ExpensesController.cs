using Microsoft.AspNetCore.Mvc;
using Shared.Security;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Services;

namespace TripPlanning.Service.Controllers;

[ApiController]
[Route("api/trips/{tripId:guid}/expenses")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    private string? ShareToken => Request.Headers[ShareTokenHeader.Name].FirstOrDefault();

    [HttpGet]
    public async Task<ActionResult<List<ExpenseDto>>> GetAll(Guid tripId)
    {
        var expenses = await _expenseService.GetExpensesAsync(tripId, User, ShareToken);
        return Ok(expenses);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExpenseDto>> GetById(Guid tripId, Guid id)
    {
        var expense = await _expenseService.GetExpenseByIdAsync(tripId, id, User, ShareToken);
        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Create(Guid tripId, ExpenseRequest request)
    {
        var expense = await _expenseService.CreateExpenseAsync(tripId, User, ShareToken, request);
        return CreatedAtAction(nameof(GetById), new { tripId, id = expense.Id }, expense);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExpenseDto>> Update(Guid tripId, Guid id, ExpenseRequest request)
    {
        var expense = await _expenseService.UpdateExpenseAsync(tripId, id, User, ShareToken, request);
        return Ok(expense);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id)
    {
        await _expenseService.DeleteExpenseAsync(tripId, id, User, ShareToken);
        return NoContent();
    }
}
