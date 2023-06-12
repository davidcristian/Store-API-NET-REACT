using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StoreAPI.Models;

namespace StoreAPI.Services
{
    public class ExpiredConfirmationCodeCleanupService : BackgroundService
    {
        private readonly ILogger<ExpiredConfirmationCodeCleanupService> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1);

        public ExpiredConfirmationCodeCleanupService(ILogger<ExpiredConfirmationCodeCleanupService> logger, IServiceScopeFactory serviceScopeFactory)
        {
            _logger = logger;
            _serviceScopeFactory = serviceScopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Checking for expired confirmation codes at {time}", DateTimeOffset.UtcNow);

                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<StoreContext>();

                    // Perhaps only remove used or unused codes?
                    var expiredCodes = await context.ConfirmationCodes
                        .Where(cc => cc.Expiration < DateTime.UtcNow)
                        .ToListAsync(stoppingToken);

                    if (expiredCodes.Any())
                    {
                        context.ConfirmationCodes.RemoveRange(expiredCodes);
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("Deleted {count} expired confirmation codes", expiredCodes.Count);
                    }
                    else
                    {
                        _logger.LogInformation("No expired confirmation codes found");
                    }
                }

                await Task.Delay(_cleanupInterval, stoppingToken);
            }
        }
    }
}
