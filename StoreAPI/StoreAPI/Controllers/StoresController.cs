using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using StoreAPI.Models;
using System.Security.Claims;

namespace StoreAPI.Controllers
{
    [Route("api/Stores")]
    [ApiController]
    public class StoresController : ControllerBase
    {
        private readonly StoreContext _context;

        public StoresController(StoreContext context)
        {
            _context = context;
        }

        // GET: api/Stores/count/10
        [HttpGet("count/{pageSize}")]
        [AllowAnonymous]
        public async Task<int> GetTotalNumberOfPages(int pageSize = 10)
        {
            int total = await _context.Stores.CountAsync();
            int totalPages = total / pageSize;
            if (total % pageSize > 0)
                totalPages++;

            return totalPages;
        }

        // GET: api/Stores/0/10
        [HttpGet("{page}/{pageSize}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Store>>> GetStores(int page = 0, int pageSize = 10)
        {
            if (_context.Stores == null)
                return NotFound();

            return await _context.Stores
                .Include(x => x.StoreShifts)
                .Include(x => x.User)
                .Skip(page * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // GET: api/Stores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StoreDTO>>> GetStores()
        {
            if (_context.Stores == null)
                return NotFound();

            return await _context.Stores
                .Select(x => StoreToDTO(x))
                .ToListAsync();
        }

        // GET: api/Stores/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Store>> GetStore(long id)
        {
            if (_context.Stores == null)
                return NotFound();

            var store = await _context.Stores
                .Include(x => x.User)
                .Include(x => x.StoreShifts)
                .ThenInclude(x => x.StoreEmployee)
                .FirstOrDefaultAsync(x => x.Id == id);
            //.FindAsync(id);
            if (store == null)
                return NotFound();

            return store;
        }

        // GET: api/Stores/search?query=walmart
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<StoreDTO>>> SearchStores(string query)
        {
            if (_context.Stores == null)
                return NotFound();

            if (query.Length < 3)
                return NotFound();

            return await _context.Stores
                .Where(x => x.Name != null && x.Name.ToLower().Contains(query.ToLower()))
                .Select(x => StoreToDTO(x))
                .Take(100)
                .ToListAsync();
        }

        // PUT: api/Stores/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStore(long id, StoreDTO storeDTO)
        {
            if (id != storeDTO.Id)
                return BadRequest();

            var store = await _context.Stores.FindAsync(id);
            if (store == null)
                return NotFound();

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            if (extracted.Item2 == AccessLevel.Regular && store.UserId != extracted.Item1)
                return Unauthorized("You can only update your own entities.");

            store.Name = storeDTO.Name;
            store.Description = storeDTO.Description;

            store.Category = storeDTO.Category;
            store.Address = storeDTO.Address;

            store.City = storeDTO.City;
            store.State = storeDTO.State;

            store.ZipCode = storeDTO.ZipCode;
            store.Country = storeDTO.Country;

            store.OpenDate = storeDTO.OpenDate;
            store.CloseDate = storeDTO.CloseDate;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!StoreExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/Stores
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<StoreDTO>> PostStore(StoreDTO storeDTO)
        {
            if (_context.Stores == null)
                return Problem("Entity set 'StoreContext.Stores' is null.");

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            var store = new Store
            {
                Name = storeDTO.Name,
                Description = storeDTO.Description,

                Category = storeDTO.Category,
                Address = storeDTO.Address,

                City = storeDTO.City,
                State = storeDTO.State,

                ZipCode = storeDTO.ZipCode,
                Country = storeDTO.Country,

                OpenDate = storeDTO.OpenDate,
                CloseDate = storeDTO.CloseDate,

                UserId = extracted.Item1,
            };

            _context.Stores.Add(store);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetStore),
                new { id = store.Id },
                StoreToDTO(store));
        }

        // DELETE: api/Stores/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStore(long id)
        {
            if (_context.Stores == null)
                return NotFound();

            var store = await _context.Stores.FindAsync(id);
            if (store == null)
                return NotFound();

            var extracted = UsersController.ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            if (extracted.Item2 == AccessLevel.Regular && store.UserId != extracted.Item1)
                return Unauthorized("You can only delete your own entities.");

            _context.Stores.Remove(store);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Stores/5/Employees
        [HttpPut("{id}/Employees")]
        public async Task<ActionResult<StoreShiftEmployeesDTO>> PutStoreShiftEmployees(long id, StoreShiftEmployeesDTO storeShiftEmployeesDTO)
        {
            if (_context.Stores == null)
                return NotFound();

            var store = await _context.Stores
                .Include(x => x.StoreShifts)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (store == null)
                return NotFound();

            var storeShifts = new List<StoreShift>();
            foreach (var storeEmployeeId in storeShiftEmployeesDTO.StoreEmployeeIds)
            {
                var storeShift = new StoreShift
                {
                    StartDate = storeShiftEmployeesDTO.StartDate,
                    EndDate = storeShiftEmployeesDTO.EndDate,

                    StoreId = store.Id,
                    StoreEmployeeId = storeEmployeeId,
                };

                storeShifts.Add(storeShift);
            }

            store.StoreShifts.Clear();
            store.StoreShifts = storeShifts;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/Stores/report/salaries/0/10
        [HttpGet("report/salaries/{page}/{pageSize}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<StoreSalaryReportDTO>>> GetStoresByAverageEmployeeSalary(int page = 0, int pageSize = 10)
        {
            if (_context.StoreShifts == null)
                return NotFound();

            var storeReports = await _context.Stores
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.Category,
                    s.Address,
                    s.City,
                    s.State,
                    s.ZipCode,
                    s.Country,
                    s.OpenDate,
                    s.CloseDate,
                    AverageSalary = _context.StoreShifts
                        .Where(shift => shift.StoreId == s.Id)
                        .Select(shift => shift.StoreEmployee.Salary)
                        .DefaultIfEmpty()
                        .Average()
                })
                .AsNoTracking()
                .OrderByDescending(store => store.AverageSalary)
                .Skip(page * pageSize)
                .Take(pageSize)
                .Select(s => new StoreSalaryReportDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Category = s.Category,
                    Address = s.Address,
                    City = s.City,
                    State = s.State,
                    ZipCode = s.ZipCode,
                    Country = s.Country,
                    OpenDate = s.OpenDate,
                    CloseDate = s.CloseDate,
                    AverageSalary = s.AverageSalary
                })
                .ToListAsync();

            if (!storeReports.Any())
                return NotFound();

            return Ok(storeReports);
        }

        // GET: api/Stores/report/salaries/count/10
        [HttpGet("report/salaries/count/{pageSize}")]
        [AllowAnonymous]
        public async Task<int> SalaryReportNumberOfPages(int pageSize = 10)
        {
            int total = await _context.Stores
                .CountAsync();

            int totalPages = total / pageSize;
            if (total % pageSize > 0)
                totalPages++;

            return totalPages;
        }

        // GET: api/Stores/report/headcount/0/10
        [HttpGet("report/headcount/{page}/{pageSize}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<StoreHeadcountReportDTO>>> GetStoresByEmployeeCount(int page = 0, int pageSize = 10)
        {
            if (_context.StoreShifts == null)
                return NotFound();

            var storeReports = await _context.Stores
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.Category,
                    s.Address,
                    s.City,
                    s.State,
                    s.ZipCode,
                    s.Country,
                    s.OpenDate,
                    s.CloseDate,
                    Headcount = _context.StoreShifts.Count(shift => shift.StoreId == s.Id)
                })
                .AsNoTracking()
                .OrderByDescending(store => store.Headcount)
                .Skip(page * pageSize)
                .Take(pageSize)
                .Select(s => new StoreHeadcountReportDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Category = s.Category,
                    Address = s.Address,
                    City = s.City,
                    State = s.State,
                    ZipCode = s.ZipCode,
                    Country = s.Country,
                    OpenDate = s.OpenDate,
                    CloseDate = s.CloseDate,
                    Headcount = s.Headcount
                })
                .ToListAsync();

            if (!storeReports.Any())
                return NotFound();

            return Ok(storeReports);
        }

        // GET: api/Stores/report/headcount/count/10
        [HttpGet("report/headcount/count/{pageSize}")]
        [AllowAnonymous]
        public async Task<int> HeadcountReportNumberOfPages(int pageSize = 10)
        {
            int total = await _context.Stores
                .CountAsync();

            int totalPages = total / pageSize;
            if (total % pageSize > 0)
                totalPages++;

            return totalPages;
        }

        private bool StoreExists(long id)
        {
            return _context.Stores.Any(e => e.Id == id);
        }

        private static StoreDTO StoreToDTO(Store store)
        {
            return new StoreDTO
            {
                Id = store.Id,
                Name = store.Name,
                Description = store.Description,

                Category = store.Category,
                Address = store.Address,

                City = store.City,
                State = store.State,

                ZipCode = store.ZipCode,
                Country = store.Country,

                OpenDate = store.OpenDate,
                CloseDate = store.CloseDate,
            };
        }
    }
}
