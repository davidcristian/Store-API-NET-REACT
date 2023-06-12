using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using StoreAPI.Middleware;
using StoreAPI.Models;
using StoreAPI.Services;
using System.Text;
using System.Text.Json.Serialization;

namespace StoreAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    policy =>
                    {
                        policy.WithOrigins("https://sdistoreapi.netlify.app")
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
            });

            // Add services to the container.
            //builder.Services.AddControllers().AddNewtonsoftJson(options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
            builder.Services.AddHostedService<ExpiredConfirmationCodeCleanupService>();

            builder.Services.AddControllers(
                options =>
                {
                    var policy = new AuthorizationPolicyBuilder()
                        .RequireAuthenticatedUser()
                        .Build();
                    options.Filters.Add(new AuthorizeFilter(policy));
                }
                )
                .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
                .AddNewtonsoftJson(options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore)
            ;

            var jwtSettingsSection = builder.Configuration.GetSection("JwtSettings");
            builder.Services.Configure<JwtSettings>(jwtSettingsSection);
            var jwtSettings = jwtSettingsSection.Get<JwtSettings>();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings!.Secret)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            var connectionString = builder.Configuration.GetConnectionString("DockerStoreDatabase");
            #if DEBUG
                connectionString = builder.Configuration.GetConnectionString("LocalStoreDatabase");
            #endif
            builder.Services.AddDbContext<StoreContext>(opt => opt
                .UseSqlServer(connectionString, options => options.CommandTimeout(60))
                //.UseLazyLoadingProxies()
            );

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.ConfigureSwaggerGen(setup =>
            {
                setup.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Store Management",
                    Version = "v1"
                });
            });

            var app = builder.Build();

            int retryCount = 0;
            while (retryCount < 6)
            {
                try
                {
                    using (var scope = app.Services.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetService<StoreContext>();
                        context!.Database.Migrate();
                        SeedData.InitializeAsync(scope.ServiceProvider).Wait();
                    }

                    break;
                }
                catch (Exception)
                {
                    retryCount++;
                    if (retryCount >= 6)
                        throw;

                    Thread.Sleep(10000);
                }
            }

            app.UseSwagger();
            app.UseSwaggerUI();
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                ;
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();

            app.UseCors();
            app.UseAuthorization();

            app.UseWebSockets();
            app.Map("/api/chat", x => x.UseMiddleware<ChatMiddleware>());

            app.MapControllers();
            app.Run();
        }
    }
}
