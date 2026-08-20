using System.Fabric;
using System.Text.Json.Serialization;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Sharing.Service.Clients;
using Sharing.Service.Services;
using Shared.Security;
using Shared.Web;

namespace Sharing.Service;

internal sealed class SharingServiceHost : StatefulService
{
    private const string CorsPolicy = "FrontendCorsPolicy";

    public SharingServiceHost(StatefulServiceContext context) : base(context)
    {
    }

    protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
    {
        return new[]
        {
            new ServiceReplicaListener(serviceContext =>
                new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                {
                    var builder = WebApplication.CreateBuilder();

                    builder.WebHost
                        .UseUrls(url)
                        .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None);

                    ConfigureServices(builder);

                    var app = builder.Build();
                    ConfigurePipeline(app);
                    return app;
                }), "ServiceEndpoint", listenOnSecondary: false),
        };
    }

    private void ConfigureServices(WebApplicationBuilder builder)
    {
        builder.Services.AddControllers()
            .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddSingleton<IReliableStateManager>(this.StateManager);

        builder.Services.AddSharedJwtAuthentication(builder.Configuration);

        builder.Services.AddHttpClient<ITripPlanningClient, TripPlanningClient>(client =>
        {
            var baseUrl = builder.Configuration["Services:TripPlanningBaseUrl"]
                ?? throw new InvalidOperationException("Missing 'Services:TripPlanningBaseUrl' configuration.");
            client.BaseAddress = new Uri(baseUrl);
        });

        builder.Services.AddScoped<IShareLinkService, ShareLinkService>();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicy, policy =>
            {
                var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                    ?? new[] { "http://localhost:5173" };
                policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
            });
        });
    }

    private static void ConfigurePipeline(WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseSharedExceptionHandling();

        app.UseCors(CorsPolicy);

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
    }
}
