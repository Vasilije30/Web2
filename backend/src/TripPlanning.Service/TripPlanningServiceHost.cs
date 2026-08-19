using System.Fabric;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Security;
using Shared.Web;
using TripPlanning.Service.Clients;
using TripPlanning.Service.Data;
using TripPlanning.Service.Services;

namespace TripPlanning.Service;

internal sealed class TripPlanningServiceHost : StatelessService
{
    private const string CorsPolicy = "FrontendCorsPolicy";

    public TripPlanningServiceHost(StatelessServiceContext context) : base(context)
    {
    }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
    {
        return new[]
        {
            new ServiceInstanceListener(serviceContext =>
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
                }), "ServiceEndpoint"),
        };
    }

    private static void ConfigureServices(WebApplicationBuilder builder)
    {
        builder.Services.AddControllers()
            .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddDbContext<TripPlanningDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("TripPlanningDb")));

        builder.Services.AddSharedJwtAuthentication(builder.Configuration);
        builder.Services.AddScoped<ITripAccessGuard, TripAccessGuard>();
        builder.Services.AddScoped<ITripService, TripService>();
        builder.Services.AddScoped<IDestinationService, DestinationService>();
        builder.Services.AddScoped<IActivityService, ActivityService>();
        builder.Services.AddScoped<IChecklistService, ChecklistService>();
        builder.Services.AddScoped<IExpenseService, ExpenseService>();

        builder.Services.AddHttpClient<ISharingServiceClient, SharingServiceClient>(client =>
        {
            var baseUrl = builder.Configuration["Services:SharingBaseUrl"]
                ?? throw new InvalidOperationException("Missing 'Services:SharingBaseUrl' configuration.");
            client.BaseAddress = new Uri(baseUrl);
        });

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

        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<TripPlanningDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<TripPlanningServiceHost>>();
            try
            {
                dbContext.Database.Migrate();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not apply database migrations on startup. Is SQL Server running? Trip endpoints will fail until it is reachable.");
            }
        }

        app.UseSharedExceptionHandling();

        app.UseCors(CorsPolicy);

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
    }
}
