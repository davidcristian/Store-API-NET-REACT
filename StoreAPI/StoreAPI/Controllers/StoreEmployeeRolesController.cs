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
using StoreAPI.Attributes;

namespace StoreAPI.Controllers
{
    [Route("api/StoreEmployeeRoles")]
    [ApiController]
    public class StoreEmployeeRolesController : ControllerBase
    {
        private readonly StoreContext _context;
        private readonly StoreEmployeeRoleValidator _validator;

        public StoreEmployeeRolesController(StoreContext context)
        {
            _context = context;
            _validator = new StoreEmployeeRoleValidator();
        }

        // GET: api/StoreEmployeeRoles/count/10
        [HttpGet("count/{pageSize}")]
        [AllowAnonymous]
        public async Task<int> GetTotalNumberOfPages(int pageSize = 10)
        {
            int total = await _context.StoreEmployeeRoles.CountAsync();
            int totalPages = total / pageSize;
            if (total % pageSize > 0)
                totalPages++;

            return totalPages;
        }

        // GET: api/StoreEmployeeRoles/0/10
        [HttpGet("{page}/{pageSize}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<StoreEmployeeRole>>> GetStoreEmployeeRoles(int page = 0, int pageSize = 10)
        {
            if (_context.StoreEmployeeRoles == null)
                return NotFound();

            return await _context.StoreEmployeeRoles
                .Include(x => x.StoreEmployees)
                .Include(x => x.User)
                .Skip(page * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // GET: api/StoreEmployeeRoles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StoreEmployeeRoleDTO>>> GetStoreEmployeeRoles()
        {
            if (_context.StoreEmployeeRoles == null)
                return NotFound();

            return await _context.StoreEmployeeRoles
                .Select(x => EmployeeRoleToDTO(x))
                .ToListAsync();
        }

        // GET: api/StoreEmployeeRoles/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<StoreEmployeeRole>> GetStoreEmployeeRole(long id)
        {
            if (_context.StoreEmployeeRoles == null)
                return NotFound();

            var employeeRole = await _context.StoreEmployeeRoles
                .Include(x => x.User)
                .Include(x => x.StoreEmployees)
                .FirstOrDefaultAsync(x => x.Id == id);
                //.FindAsync(id);
            if (employeeRole == null)
                return NotFound();

            return employeeRole;
        }

        // GET: api/StoreEmployeeRoles/search?query=trainee
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<StoreEmployeeRoleDTO>>> SearchStoreEmployeeRoles(string query)
        {
            if (_context.StoreEmployeeRoles == null)
                return NotFound();

            if (query.Length < 3)
                return NotFound();

            return await _context.StoreEmployeeRoles
                .Where(x => x.Name != null && x.Name.ToLower().Contains(query.ToLower()))
                .Select(x => EmployeeRoleToDTO(x))
                .Take(100)
                .ToListAsync();
        }

        // PUT: api/StoreEmployeeRoles/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStoreEmployeeRole(long id, StoreEmployeeRoleDTO employeeRoleDTO)
        {
            if (id != employeeRoleDTO.Id)
                return BadRequest();

            var employeeRole = await _context.StoreEmployeeRoles.FindAsync(id);
            if (employeeRole == null)
                return NotFound();

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            if (extracted.Item2 == AccessLevel.Regular && employeeRole.UserId != extracted.Item1)
                return Unauthorized("You can only update your own entities.");

            // Validate the employee role
            var validationResult = _validator.Validate(employeeRoleDTO);
            if (validationResult != string.Empty)
                return BadRequest(validationResult);

            employeeRole.Name = employeeRoleDTO.Name;
            employeeRole.Description = employeeRoleDTO.Description;
            employeeRole.RoleLevel = employeeRoleDTO.RoleLevel;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!StoreEmployeeRoleExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/StoreEmployeeRoles
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<StoreEmployeeRoleDTO>> PostStoreEmployeeRole(StoreEmployeeRoleDTO employeeRoleDTO)
        {
            if (_context.StoreEmployeeRoles == null)
                return Problem("Entity set 'StoreContext.StoreEmployeeRoles' is null.");

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            // Validate the employee role
            var validationResult = _validator.Validate(employeeRoleDTO);
            if (validationResult != string.Empty)
                return BadRequest(validationResult);

            var employeeRole = new StoreEmployeeRole
            {
                Name = employeeRoleDTO.Name,
                Description = employeeRoleDTO.Description,

                RoleLevel = employeeRoleDTO.RoleLevel,
                StoreEmployees = null!,

                UserId = extracted.Item1,
            };

            _context.StoreEmployeeRoles.Add(employeeRole);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetStoreEmployeeRole),
                new { id = employeeRole.Id },
                EmployeeRoleToDTO(employeeRole));
        }

        // DELETE: api/StoreEmployeeRoles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStoreEmployeeRole(long id)
        {
            if (_context.StoreEmployeeRoles == null)
                return NotFound();

            var employeeRole = await _context.StoreEmployeeRoles.FindAsync(id);
            if (employeeRole == null)
                return NotFound();

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            if (extracted.Item2 == AccessLevel.Regular && employeeRole.UserId != extracted.Item1)
                return Unauthorized("You can only delete your own entities.");

            _context.StoreEmployeeRoles.Remove(employeeRole);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/StoreEmployeeRoles/5/StoreEmployees
        [HttpPost("{id}/StoreEmployees")]
        public async Task<IActionResult> PostStoreEmployeesToRole(long id, List<StoreEmployeeDTO> storeEmployeesDTO)
        {
            if (_context.StoreEmployeeRoles == null)
                return NotFound();

            var employeeRole = await _context.StoreEmployeeRoles.FindAsync(id);
            if (employeeRole == null)
                return NotFound();

            foreach (var employeeDTO in storeEmployeesDTO)
            {
                var storeEmployee = new StoreEmployee
                {
                    FirstName = employeeDTO.FirstName,
                    LastName = employeeDTO.LastName,

                    Gender = employeeDTO.Gender,

                    EmploymentDate = employeeDTO.EmploymentDate,
                    TerminationDate = employeeDTO.TerminationDate,
                    Salary = employeeDTO.Salary,

                    StoreEmployeeRoleId = id,
                };

                _context.StoreEmployees.Add(storeEmployee);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/StoreEmployeeRoles/5/StoreEmployees
        [HttpPut("{id}/StoreEmployees")]
        public async Task<IActionResult> PutStoreItemsToCategory(long id, [FromBody] List<long> storeEmployeeIds)
        {
            if (_context.StoreEmployeeRoles == null)
                return NotFound();

            if (storeEmployeeIds.Distinct().Count() != storeEmployeeIds.Count)
                return BadRequest();

            var employeeRole = await _context.StoreEmployeeRoles
                .Include(x => x.StoreEmployees)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (employeeRole == null)
                return NotFound();

            var storeEmployees = await _context.StoreEmployees
                .Where(x => storeEmployeeIds.Contains(x.Id))
                .ToListAsync();
            if (storeEmployees.Count != storeEmployeeIds.Count)
                return BadRequest();

            employeeRole.StoreEmployees.Clear();
            employeeRole.StoreEmployees = storeEmployees;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool StoreEmployeeRoleExists(long id)
        {
            return _context.StoreEmployeeRoles.Any(e => e.Id == id);
        }

        private static StoreEmployeeRoleDTO EmployeeRoleToDTO(StoreEmployeeRole employeeRole)
        {
            return new StoreEmployeeRoleDTO
            {
                Id = employeeRole.Id,
                Name = employeeRole.Name,
                Description = employeeRole.Description,

                RoleLevel = employeeRole.RoleLevel,
            };
        }
    }
}
