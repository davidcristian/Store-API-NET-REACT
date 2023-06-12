using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Bogus;
using StoreAPI.Controllers;

namespace StoreAPI.Models
{
    public static class SeedData
    {
        // Add a nested class to use as a type argument for ILogger
        private class SeedDataLogger { }
        private const long STACK_OVERFLOW_LOOPS = 1_000_000;

        private const int MIN_ROLE_LEVEL = 1;
        private const int MAX_ROLE_LEVEL = 100;

        private const int EMPLOYEE_ROLES_COUNT = 1_000;
        private const int EMPLOYEES_COUNT = 1_000;
        private const int STORES_COUNT = 1_000;
        private const int STORE_SHIFTS_COUNT = 10_000;

        private const int USERS_COUNT = 100;
        private static readonly string PASSWORD = UsersController.HashPassword("a");
        private const AccessLevel ACCESS_LEVEL = AccessLevel.Regular;
        private const long PAGE_PREFERENCE = 5;

        public static async Task SeedUsersAndProfilesAsync(StoreContext context, int n)
        {
            var existingUserIds = await context.Users.Select(u => u.Id).ToListAsync();
            var userNames = await context.Users.Select(u => u.Name).ToListAsync();

            // Generate users
            var users = new List<User>();
            var fakerUser = new Faker<User>()
                .RuleFor(u => u.Name, f => f.Internet.UserName())
                .RuleFor(u => u.Password, PASSWORD)
                .RuleFor(u => u.AccessLevel, ACCESS_LEVEL);

            // Loop n times and only add users with names that are not in the database
            for (int i = 0; i < n; i++)
            {
                var user = fakerUser.Generate();

                long current = 0;
                while (userNames.Contains(user.Name))
                {
                    if (current++ > STACK_OVERFLOW_LOOPS)
                        throw new Exception("Could not find a unique user name");

                    user = fakerUser.Generate();
                }

                users.Add(user);
                userNames.Add(user.Name);
            }

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();

            // Generate user profiles
            var newUserIds = await context.Users
                .Where(u => !existingUserIds.Contains(u.Id))
                .Select(u => u.Id).ToListAsync();

            var userProfiles = new List<UserProfile>();
            var fakerProfile = new Faker<UserProfile>()
                .RuleFor(up => up.Bio, f => string.Join("\n", f.Lorem.Paragraphs(3)))
                .RuleFor(up => up.Location, f => f.Address.City())
                .RuleFor(up => up.Birthday, f => f.Date.Between(DateTime.Now.AddYears(-60), DateTime.Now.AddYears(-18)))
                .RuleFor(up => up.Gender, f => f.PickRandom<Gender>())
                .RuleFor(up => up.MaritalStatus, f => f.PickRandom<MaritalStatus>())
                .RuleFor(up => up.PagePreference, PAGE_PREFERENCE);

            foreach (var userId in newUserIds)
            {
                var userProfile = fakerProfile.Generate();
                userProfile.UserId = userId;
                userProfiles.Add(userProfile);
            }

            await context.UserProfiles.AddRangeAsync(userProfiles);
            await context.SaveChangesAsync();
        }

        public static async Task SeedEmployeeRolesAsync(StoreContext context, int n, long? userId = null)
        {
            var random = new Random();

            var userIds = await context.Users.Select(u => u.Id).ToListAsync();
            long RandomUserId() => userIds[random.Next(userIds.Count)];

            var faker = new Faker<StoreEmployeeRole>()
                .RuleFor(er => er.Name, f => f.Name.JobTitle())
                .RuleFor(er => er.Description, f => string.Join("\n", f.Lorem.Paragraphs(3)))
                .RuleFor(er => er.RoleLevel, f => f.Random.Int(MIN_ROLE_LEVEL, MAX_ROLE_LEVEL))
                .RuleFor(er => er.UserId, userId ?? RandomUserId());

            var employeeRoles = faker.Generate(n);

            await context.StoreEmployeeRoles.AddRangeAsync(employeeRoles);
            await context.SaveChangesAsync();
        }

        public static async Task SeedEmployeesAsync(StoreContext context, int n, long? userId = null)
        {
            var random = new Random();

            var roleIds = await context.StoreEmployeeRoles.Select(er => er.Id).ToListAsync();
            long RandomRoleId() => roleIds[random.Next(roleIds.Count)];

            var userIds = await context.Users.Select(u => u.Id).ToListAsync();
            long RandomUserId() => userIds[random.Next(userIds.Count)];

            var faker = new Faker<StoreEmployee>()
                .RuleFor(e => e.FirstName, f => f.Name.FirstName())
                .RuleFor(e => e.LastName, f => f.Name.LastName())
                .RuleFor(e => e.Gender, f => f.PickRandom<Gender>())
                .RuleFor(e => e.EmploymentDate, f => f.Date.Between(DateTime.Now.AddYears(-10), DateTime.Now))
                .RuleFor(e => e.TerminationDate, (f, e) => e.EmploymentDate.HasValue && f.Random.Bool(0.2f) ? f.Date.Between(e.EmploymentDate.Value, DateTime.Now) : null)
                .RuleFor(e => e.Salary, f => Math.Round(f.Random.Double(30000, 120000), 2))
                .RuleFor(e => e.StoreEmployeeRoleId, RandomRoleId())
                .RuleFor(e => e.UserId, userId ?? RandomUserId());

            var employees = faker.Generate(n);

            await context.StoreEmployees.AddRangeAsync(employees);
            await context.SaveChangesAsync();
        }

        public static async Task SeedStoresAsync(StoreContext context, int n, long? userId = null)
        {
            var random = new Random();

            var userIds = await context.Users.Select(u => u.Id).ToListAsync();
            long RandomUserId() => userIds[random.Next(userIds.Count)];

            var faker = new Faker<Store>()
                .RuleFor(s => s.Name, f => $"{f.Company.CompanyName()} Store")
                .RuleFor(s => s.Description, f => string.Join("\n", f.Lorem.Paragraphs(3)))
                .RuleFor(s => s.Category, f => f.PickRandom<StoreCategory>())
                .RuleFor(s => s.Address, f => f.Address.StreetAddress())
                .RuleFor(s => s.City, f => f.Address.City())
                .RuleFor(s => s.State, f => f.Address.StateAbbr())
                .RuleFor(s => s.ZipCode, f => f.Address.ZipCode())
                .RuleFor(s => s.Country, f => f.Address.Country())
                .RuleFor(s => s.OpenDate, f => f.Date.Between(DateTime.Now.AddYears(-20), DateTime.Now))
                .RuleFor(s => s.CloseDate, (f, s) => s.OpenDate.HasValue && f.Random.Bool(0.1f) ? f.Date.Between(s.OpenDate.Value, DateTime.Now) : null)
                .RuleFor(s => s.UserId, userId ?? RandomUserId());

            var stores = faker.Generate(n);

            await context.Stores.AddRangeAsync(stores);
            await context.SaveChangesAsync();
        }

        private class StoreEmployeePair
        {
            public long StoreId { get; set; }
            public long EmployeeId { get; set; }
        }

        private class StoreEmployeePairComparer : IEqualityComparer<StoreEmployeePair>
        {
            public bool Equals(StoreEmployeePair? x, StoreEmployeePair? y)
            {
                if (ReferenceEquals(x, y)) return true;
                if (x is null || y is null) return false;

                return x.StoreId == y.StoreId && x.EmployeeId == y.EmployeeId;
            }

            public int GetHashCode(StoreEmployeePair obj)
            {
                return HashCode.Combine(obj.StoreId, obj.EmployeeId);
            }
        }

        public static async Task SeedStoreShiftsAsync(StoreContext context, int n, long? userId = null)
        {
            var random = new Random();

            var userIds = await context.Users.Select(u => u.Id).ToListAsync();
            long RandomUserId() => userIds[random.Next(userIds.Count)];

            var storeIds = await context.Stores.Select(s => s.Id).ToListAsync();
            var employeeIds = await context.StoreEmployees.Select(e => e.Id).ToListAsync();

            var storeShifts = new List<StoreShift>();
            var faker = new Faker<StoreShift>()
                .RuleFor(ss => ss.StartDate, f => f.Date.Between(DateTime.Now.AddYears(-5), DateTime.Now))
                .RuleFor(ss => ss.EndDate, (f, ss) => ss.StartDate.HasValue ? f.Date.Between(ss.StartDate.Value, DateTime.Now) : null)
                .RuleFor(ss => ss.UserId, userId ?? RandomUserId());

            var storeEmployeePairs = new HashSet<StoreEmployeePair>(new StoreEmployeePairComparer());
            storeEmployeePairs.UnionWith(await context.StoreShifts.Select(ss => new StoreEmployeePair { StoreId = ss.StoreId, EmployeeId = ss.StoreEmployeeId }).ToListAsync());

            StoreEmployeePair RandomStoreEmployeePair()
            {
                long storeId;
                long employeeId;
                var pair = new StoreEmployeePair();

                do
                {
                    storeId = storeIds[random.Next(storeIds.Count)];
                    employeeId = employeeIds[random.Next(employeeIds.Count)];

                    pair.StoreId = storeId;
                    pair.EmployeeId = employeeId;
                } while (storeEmployeePairs.Contains(pair));

                storeEmployeePairs.Add(pair);
                return pair;
            }

            for (int i = 0; i < n; i++)
            {
                var storeShift = faker.Generate();
                var pair = RandomStoreEmployeePair();

                storeShift.StoreId = pair.StoreId;
                storeShift.StoreEmployeeId = pair.EmployeeId;

                storeShifts.Add(storeShift);
            }

            await context.StoreShifts.AddRangeAsync(storeShifts);
            await context.SaveChangesAsync();
        }

        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using (var context = new StoreContext(serviceProvider.GetRequiredService<DbContextOptions<StoreContext>>()))
            {
                var logger = serviceProvider.GetRequiredService<ILogger<SeedDataLogger>>();
                logger.LogInformation("Seeding process started at {time}", DateTimeOffset.UtcNow);

                //if (!await context.UserProfiles.AnyAsync())
                if (!await context.Users.AnyAsync())
                    await SeedUsersAndProfilesAsync(context, USERS_COUNT);

                if (!await context.StoreEmployeeRoles.AnyAsync())
                    await SeedEmployeeRolesAsync(context, EMPLOYEE_ROLES_COUNT);
                
                if (!await context.StoreEmployees.AnyAsync())
                    await SeedEmployeesAsync(context, EMPLOYEES_COUNT);
                
                if (!await context.Stores.AnyAsync())
                    await SeedStoresAsync(context, STORES_COUNT);
                
                if (!await context.StoreShifts.AnyAsync())
                    await SeedStoreShiftsAsync(context, STORE_SHIFTS_COUNT);

                logger.LogInformation("Seeding process finished at {time}", DateTimeOffset.UtcNow);
            }
        }
    }
}
