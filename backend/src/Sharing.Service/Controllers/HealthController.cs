using Microsoft.AspNetCore.Mvc;

namespace Sharing.Service.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "healthy", service = "Sharing.Service" });
}
