using Microsoft.AspNetCore.Mvc;

namespace TripPlanning.Service.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "healthy", service = "TripPlanning.Service" });
}
