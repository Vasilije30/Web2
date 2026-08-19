using Microsoft.AspNetCore.Mvc;
using Shared.Security;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Services;

namespace TripPlanning.Service.Controllers;

[ApiController]
[Route("api/trips/{tripId:guid}/budget")]
public class BudgetController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public BudgetController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<BudgetSummaryDto>> Get(Guid tripId)
    {
        var shareToken = Request.Headers[ShareTokenHeader.Name].FirstOrDefault();
        var summary = await _expenseService.GetBudgetSummaryAsync(tripId, User, shareToken);
        return Ok(summary);
    }
}
