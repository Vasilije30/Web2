using System.Fabric;
using System.Text.Json.Serialization;
using Identity.Service.Data;
using Identity.Service.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Security;

namespace Identity.Service;

internal sealed class IdentityServiceHost : StatelessService
{
    private const string CorsPolicy = "FrontendCorsPolicy";

    public IdentityServiceHost(StatelessServiceContext context) : base(context)
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

        builder.Services.AddDbContext<IdentityDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("IdentityDb")));

        builder.Services.AddSharedJwtAuthentication(builder.Configuration);
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<ITokenService, TokenService>();
        builder.Services.AddScoped<IAdminUserService, AdminUserService>();

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
            var dbContext = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<IdentityServiceHost>>();
            try
            {
                dbContext.Database.Migrate();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not apply database migrations on startup. Is SQL Server running? Auth endpoints will fail until it is reachable.");
            }
        }

        app.UseCors(CorsPolicy);

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
    }
}
