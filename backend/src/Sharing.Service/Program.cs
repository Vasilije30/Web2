using Microsoft.ServiceFabric.Services.Runtime;
using Sharing.Service;

await ServiceRuntime.RegisterServiceAsync("Sharing.ServiceType",
    context => new SharingServiceHost(context));

await Task.Delay(Timeout.Infinite);
