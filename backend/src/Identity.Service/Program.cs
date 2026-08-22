using Identity.Service;
using Microsoft.ServiceFabric.Services.Runtime;

await ServiceRuntime.RegisterServiceAsync("Identity.ServiceType",
    context => new IdentityServiceHost(context));

await Task.Delay(Timeout.Infinite);
