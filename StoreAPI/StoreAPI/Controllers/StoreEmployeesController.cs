using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using StoreAPI.Models;
using StoreAPI.Validators;
using System.Security.Claims;
using System.Drawing.Printing;
using Microsoft.ML.Data;
using Microsoft.ML;

namespace StoreAPI.Controllers
{
    public class EmployeeInput
    {
        public string? Role { get; set; }
        public int Tenure { get; set; }

        [ColumnName("Label")]
        public float Salary { get; set; }
    }

    public class EmployeeOutput
    {
        [ColumnName("Score")]
        public float Salary { get; set; }
    }

    [Route("api/StoreEmployees")]
    [ApiController]
    public class StoreEmployeesController : ControllerBase
    {
        private readonly StoreContext _context;
        private readonly StoreEmployeeValidator _validator;
        private readonly PredictionEngine<EmployeeInput, EmployeeOutput> _predictionEngine;

        public StoreEmployeesController(StoreContext context)
        {
            _context = context;
            _validator = new StoreEmployeeValidator();

            // Create MLContext
            var mlContext = new MLContext();
            var model = mlContext.Model.Load("ML/salary_model.zip", out _);

            // Create prediction engine
            _predictionEngine = mlContext.Model.CreatePredictionEngine<EmployeeInput, EmployeeOutput>(model);
        }

        // GET: api/StoreEmployees/predict/role=manager&tenure=365
        [HttpGet("predict")]
        [AllowAnonymous]
        public ActionResult<float> Predict([FromQuery] string role, [FromQuery] int tenure)
        {
            // Create model input
            var input = new EmployeeInput
            {
                Role = role,
                Tenure = tenure
            };

            // Make prediction
            var prediction = _predictionEngine.Predict(input);

            // Return prediction result
            return Ok(prediction.Salary);
        }

        // GET: api/StoreEmployees/count/10
        [HttpGet("count/{pageSize}")]
        [AllowAnonymous]
        public async Task<int> GetTotalNumberOfPages(int pageSize = 10)
        {
            int total = await _context.StoreEmployees.CountAsync();
            int totalPages = total / pageSize;
            if (total % pageSize > 0)
                totalPages++;

            return totalPages;
        }

        // GET: api/StoreEmployees/0/10
        [HttpGet("{page}/{pageSize}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<StoreEmployee>>> GetStoreEmployee(int page = 0, int pageSize = 10)
        {
            if (_context.StoreEmployees == null)
                return NotFound();

            return await _context.StoreEmployees
                .Include(x => x.StoreEmployeeRole)
                .Include(x => x.StoreShifts)
                .Include(x => x.User)
                .Skip(page * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // GET: api/StoreEmployees
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StoreEmployee>>> GetStoreEmployee()
        {
            if (_context.StoreEmployees == null)
                return NotFound();

            return await _context.StoreEmployees
                .Include(x => x.StoreEmployeeRole)
                .ToListAsync();
        }

        // GET: api/StoreEmployees/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<StoreEmployee>> GetStoreEmployee(long id)
        {
            if (_context.StoreEmployees == null)
                return NotFound();
            
            var storeEmployee = await _context.StoreEmployees
                .Include(x => x.User)
                .Include(x => x.StoreEmployeeRole)
                .Include(x => x.StoreShifts)
                .ThenInclude(x => x.Store)
                .FirstOrDefaultAsync(x => x.Id == id);
                //.FindAsync(id);
            if (storeEmployee == null)
                return NotFound();

            return storeEmployee;
        }

        // GET: api/StoreEmployees/search?query=john
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<StoreEmployeeDTO>>> SearchStoreEmployees(string query)
        {
            if (_context.StoreEmployees == null)
                return NotFound();

            if (query.Length < 3)
                return NotFound();

            return await _context.StoreEmployees
                .Where(x => (x.FirstName != null && x.FirstName.ToLower().Contains(query.ToLower())) || (x.LastName != null && x.LastName.ToLower().Contains(query.ToLower())))
                .Select(x => EmployeeToDTO(x))
                .Take(100)
                .ToListAsync();
        }

        // PUT: api/StoreEmployees/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStoreEmployee(long id, StoreEmployeeDTO employeeDTO)
        {
            if (id != employeeDTO.Id)
                return BadRequest();

            var storeEmployee = await _context.StoreEmployees.FindAsync(id);
            if (storeEmployee == null)
                return NotFound();

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            if (extracted.Item2 == AccessLevel.Regular && storeEmployee.UserId != extracted.Item1)
                return Unauthorized("You can only update your own entities.");

            // validate the store employee
            var validationResult = _validator.Validate(employeeDTO);
            if (validationResult != string.Empty)
                return BadRequest(validationResult);

            // search for the role id and return BadRequest if it is invalid
            var storeEmployeeRole = await _context.StoreEmployeeRoles.FindAsync(employeeDTO.StoreEmployeeRoleId);
            if (storeEmployeeRole == null)
                return BadRequest();

            storeEmployee.FirstName = employeeDTO.FirstName;
            storeEmployee.LastName = employeeDTO.LastName;

            storeEmployee.Gender = employeeDTO.Gender;

            storeEmployee.EmploymentDate = employeeDTO.EmploymentDate;
            storeEmployee.TerminationDate = employeeDTO.TerminationDate;
            storeEmployee.Salary = employeeDTO.Salary;

            storeEmployee.StoreEmployeeRoleId = employeeDTO.StoreEmployeeRoleId;
            storeEmployee.StoreEmployeeRole = storeEmployeeRole;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!StoreEmployeeExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/StoreEmployees
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<StoreEmployeeDTO>> PostStoreEmployee(StoreEmployeeDTO employeeDTO)
        {
            if (_context.StoreEmployees == null)
                return Problem("Entity set 'StoreContext.StoreEmployees' is null.");

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            // validate the store employee
            var validationResult = _validator.Validate(employeeDTO);
            if (validationResult != string.Empty)
                return BadRequest(validationResult);

            // search for the role id and return BadRequest if it is invalid
            var storeEmployeeRole = await _context.StoreEmployeeRoles.FindAsync(employeeDTO.StoreEmployeeRoleId);
            if (storeEmployeeRole == null)
                return BadRequest();

            var storeEmployee = new StoreEmployee
            {
                FirstName = employeeDTO.FirstName,
                LastName = employeeDTO.LastName,

                Gender = employeeDTO.Gender,

                EmploymentDate = employeeDTO.EmploymentDate,
                TerminationDate = employeeDTO.TerminationDate,
                Salary = employeeDTO.Salary,

                StoreEmployeeRoleId = employeeDTO.StoreEmployeeRoleId,
                StoreEmployeeRole = storeEmployeeRole,

                UserId = extracted.Item1,
            };

            _context.StoreEmployees.Add(storeEmployee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetStoreEmployee),
                new { id = employeeDTO.Id },
                EmployeeToDTO(storeEmployee));
        }

        // DELETE: api/StoreEmployees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStoreEmployee(long id)
        {
            if (_context.StoreEmployees == null)
                return NotFound();
            
            var storeEmployee = await _context.StoreEmployees.FindAsync(id);
            if (storeEmployee == null)
                return NotFound();

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            if (extracted.Item2 == AccessLevel.Regular && storeEmployee.UserId != extracted.Item1)
                return Unauthorized("You can only delete your own entities.");

            _context.StoreEmployees.Remove(storeEmployee);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // FILTER: api/StoreEmployees/filter/0/10?minSalary=3000
        [HttpGet("filter/{page}/{pageSize}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<StoreEmployee>>> FilterStoreEmployees(double minSalary, int page = 0, int pageSize = 10)
        {
            if (_context.StoreEmployees == null)
                return NotFound();

            var employees = await _context.StoreEmployees
                .Where(x => x.Salary >= minSalary)
                .Skip(page * pageSize)
                .Take(pageSize)
                .Include(x => x.StoreEmployeeRole)
                .AsNoTracking()
                .ToListAsync();

            if (!employees.Any())
                return NotFound();

            return Ok(employees);
        }

        // GET: api/StoreEmployees/filter/count/10?minSalary=3000
        [HttpGet("filter/count/{pageSize}")]
        [AllowAnonymous]
        public async Task<int> SalaryFilterNumberOfPages(double minSalary, int pageSize = 10)
        {
            int total = await _context.StoreEmployees
                .Where(x => x.Salary >= minSalary)
                .AsNoTracking()
                .CountAsync();

            int totalPages = total / pageSize;
            if (total % pageSize > 0)
                totalPages++;

            return totalPages;
        }

        private bool StoreEmployeeExists(long id)
        {
            return _context.StoreEmployees.Any(e => e.Id == id);
        }

        private static StoreEmployeeDTO EmployeeToDTO(StoreEmployee employee)
        {
            return new StoreEmployeeDTO
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,

                Gender = employee.Gender,

                EmploymentDate = employee.EmploymentDate,
                TerminationDate = employee.TerminationDate,
                Salary = employee.Salary,

                StoreEmployeeRoleId = employee.StoreEmployeeRoleId,
            };
        }
    }
}
