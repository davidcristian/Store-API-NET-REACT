using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moq.EntityFrameworkCore;
using StoreAPI.Controllers;
using StoreAPI.Models;

namespace StoreAPITest
{
    [TestFixture]
    public class GetStoresByAverageEmployeeSalary
    {
        // Using an in-memory database is technically
        // considered integration testing because we're
        // testing the interaction between the code and the
        // database, even if the database is in-memory.

        // Unit tests are intended to test a "unit" of code in isolation,
        // which means mocking or stubbing all dependencies. However, in
        // the case of Entity Framework and other ORMs, it's often more
        // practical to use an in-memory database for testing. This is
        // because ORMs typically involve complex interactions with a
        // database, and mocking these interactions can be difficult
        // and lead to tests that don't accurately represent how the
        // code will behave in production.

        private StoreContext _context;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<StoreContext>()
                .UseInMemoryDatabase(databaseName: "SalariesTestDatabase")
                .Options;

            _context = new StoreContext(options);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
        }

        [Test]
        public async Task GetStoresByAverageEmployeeSalary_ReturnsExpectedResult()
        {
            var roles = new List<StoreEmployeeRole>
            {
                new StoreEmployeeRole
                {
                    Id = 1,
                    Name = "Trainee",
                    Description = "New employee",
                    RoleLevel = 1
                },
            };

            var employees = new List<StoreEmployee>
            {
                new StoreEmployee
                {
                    Id = 1,
                    FirstName = "John",
                    LastName = "Doe",
                    Gender = Gender.Male,
                    EmploymentDate = DateTime.Now,
                    TerminationDate = null,
                    StoreEmployeeRoleId = 1,
                    Salary = 1000
                },
                new StoreEmployee
                {
                    Id = 2,
                    FirstName = "Jane",
                    LastName = "Smith",
                    Gender = Gender.Female,
                    EmploymentDate = DateTime.Now,
                    TerminationDate = null,
                    StoreEmployeeRoleId = 1,
                    Salary = 2000
                },
                new StoreEmployee
                {
                    Id = 3,
                    FirstName = "Oliver",
                    LastName = "Karlsen",
                    Gender = Gender.Male,
                    EmploymentDate = DateTime.Now,
                    TerminationDate = null,
                    StoreEmployeeRoleId = 1,
                    Salary = 3000
                },
            };

            var stores = new List<Store>
            {
                new Store
                {
                    Id = 1,
                    Name = "Burger King",
                    Description = "Fast food restaurant",
                    Category = StoreCategory.Food,
                    Address = "123 Main Street",
                    City = "New York",
                    State = "NY",
                    ZipCode = "10001",
                    Country = "USA",
                    OpenDate = DateTime.Now,
                    CloseDate = null,
                },
                new Store
                {
                    Id = 2,
                    Name = "McDonalds",
                    Description = "Fast food restaurant",
                    Category = StoreCategory.Food,
                    Address = "456 Main Street",
                    City = "New York",
                    State = "NY",
                    ZipCode = "10001",
                    Country = "USA",
                    OpenDate = DateTime.Now,
                    CloseDate = null,
                },
                new Store
                {
                    Id = 3,
                    Name = "Wendy's",
                    Description = "Fast food restaurant",
                    Category = StoreCategory.Food,
                    Address = "789 Main Street",
                    City = "New York",
                    State = "NY",
                    ZipCode = "10001",
                    Country = "USA",
                    OpenDate = DateTime.Now,
                    CloseDate = null,
                },
            };

            var storeShifts = new List<StoreShift>
            {
                new StoreShift
                {
                    StartDate = DateTime.Now,
                    EndDate = DateTime.Now.AddHours(8),
                    StoreId = 2,
                    StoreEmployeeId = 1,
                },
                new StoreShift
                {
                    StartDate = DateTime.Now,
                    EndDate = DateTime.Now.AddHours(8),
                    StoreId = 2,
                    StoreEmployeeId = 2,
                },
                new StoreShift
                {
                    StartDate = DateTime.Now,
                    EndDate = DateTime.Now.AddHours(8),
                    StoreId = 3,
                    StoreEmployeeId = 3,
                },
            };

            _context.StoreEmployeeRoles.AddRange(roles);
            _context.StoreEmployees.AddRange(employees);
            _context.Stores.AddRange(stores);
            _context.StoreShifts.AddRange(storeShifts);
            await _context.SaveChangesAsync();

            var controller = new StoresController(_context);
            var actionResult = await controller.GetStoresByAverageEmployeeSalary();

            var okResult = actionResult.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);

            var shifts = okResult.Value as List<StoreSalaryReportDTO>;
            Assert.That(shifts, Is.Not.Null);

            Assert.That(shifts.Count, Is.EqualTo(3));
            Assert.That(shifts[0].Id, Is.EqualTo(3));
            Assert.That(shifts[1].Id, Is.EqualTo(2));
            Assert.That(shifts[2].Id, Is.EqualTo(1));
            Assert.That(shifts[0].AverageSalary, Is.EqualTo(3000d));
            Assert.That(shifts[1].AverageSalary, Is.EqualTo(1500d));
            Assert.That(shifts[2].AverageSalary, Is.EqualTo(0d));
        }
    }
}
