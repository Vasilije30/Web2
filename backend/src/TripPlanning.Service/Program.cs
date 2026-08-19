using Microsoft.ServiceFabric.Services.Runtime;
using TripPlanning.Service;

await ServiceRuntime.RegisterServiceAsync("TripPlanning.ServiceType",
    context => new TripPlanningServiceHost(context));

await Task.Delay(Timeout.Infinite);
