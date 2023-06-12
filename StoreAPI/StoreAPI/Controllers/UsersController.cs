using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Castle.Components.DictionaryAdapter.Xml;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using StoreAPI.Attributes;
using StoreAPI.Models;
using StoreAPI.Validators;

namespace StoreAPI.Controllers
{
    [Route("api/Users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly StoreContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly UserValidator _validator;

        public UsersController(StoreContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _validator = new UserValidator();
        }

        public static string HashPassword(string password)
        {
            byte[] hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Name!.ToString()),
                    
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, user.AccessLevel.ToString()),

                    new Claim("PagePreference", user.UserProfile.PagePreference.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static string GenerateRandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private async Task<ConfirmationCode> GenerateConfirmationCode(User user)
        {
            string code = string.Empty;
            bool exists = true;

            while (exists)
            {
                code = GenerateRandomString(8);
                exists = await _context.ConfirmationCodes.AnyAsync(cc => cc.Code == code);
            }

            var confirmationCode = new ConfirmationCode
            {
                UserId = user.Id,
                Code = code,
                Expiration = DateTime.UtcNow.AddMinutes(10),
                Used = false
            };

            _context.ConfirmationCodes.Add(confirmationCode);
            await _context.SaveChangesAsync();

            return confirmationCode;
        }

        // POST: api/Users/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<dynamic>> Register(UserRegisterDTO userRegisterDTO)
        {
            // Validate the employee role
            var validationResult = _validator.ValidateRegister(userRegisterDTO);
            if (validationResult != string.Empty)
                return BadRequest(validationResult);

            if (await _context.Users.AnyAsync(u => u.Name == userRegisterDTO.Name))
                return BadRequest("Username already exists");

            var user = new User
            {
                Name = userRegisterDTO.Name,
                Password = HashPassword(userRegisterDTO.Password!),

                UserProfile = new UserProfile
                {
                    Bio = userRegisterDTO.Bio,
                    Location = userRegisterDTO.Location,
                    Birthday = userRegisterDTO.Birthday,
                    Gender = userRegisterDTO.Gender,
                    MaritalStatus = userRegisterDTO.MaritalStatus
                }
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDTO = UserToDTO(user);
            userDTO.Password = null;

            var confirmationCode = await GenerateConfirmationCode(user);

            return new
            {
                user = userDTO,
                token = confirmationCode.Code,
                expiration = confirmationCode.Expiration
            };
        }

        // POST: api/Users/register/confirm
        [HttpPost("register/confirm/{code}")]
        [AllowAnonymous]
        public async Task<ActionResult> ConfirmAccount(string code)
        {
            var confirmationCode = await _context.ConfirmationCodes
                .SingleOrDefaultAsync(cc => cc.Code == code);
            if (confirmationCode == null)
                return BadRequest("Invalid confirmation code.");

            if (confirmationCode.Used)
                return BadRequest("Confirmation code has already been used.");
            if (confirmationCode.Expiration < DateTime.UtcNow)
                return BadRequest("Confirmation code has expired.");

            var user = await _context.Users.FindAsync(confirmationCode.UserId);
            if (user == null)
                return BadRequest("Invalid confirmation code.");

            if (user.AccessLevel > 0)
                return BadRequest("Account has already been confirmed.");

            user.AccessLevel = AccessLevel.Regular;
            confirmationCode.Used = true;
            await _context.SaveChangesAsync();

            return Ok("Account successfully confirmed.");
        }

        // POST: api/Users/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(UserDTO userDTO)
        {
            if (userDTO.Name == null || userDTO.Password == null)
                return BadRequest();

            var hashedPassword = HashPassword(userDTO.Password);
            var user = await _context.Users
                .Include(u => u.UserProfile)
                .SingleOrDefaultAsync(u => u.Name == userDTO.Name && u.Password != null && u.Password == hashedPassword);
            if (user == null)
                return Unauthorized("Invalid username or password");

            // Check if user is confirmed
            if (user.AccessLevel == 0)
                return Unauthorized("User is not confirmed");

            var token = GenerateJwtToken(user);
            return Ok(token);
        }

        // GET: api/Users/count/10
        [HttpGet("count/{pageSize}")]
        [Role(AccessLevel.Admin)]
        public async Task<int> GetTotalNumberOfPages(int pageSize = 10)
        {
            int total = await _context.Users.CountAsync();
            int totalPages = total / pageSize;
            if (total % pageSize > 0)
                totalPages++;

            return totalPages;
        }

        // GET: api/Users/0/10
        [HttpGet("{page}/{pageSize}")]
        [Role(AccessLevel.Admin)]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers(int page = 0, int pageSize = 10)
        {
            if (_context.Users == null)
                return NotFound();

            return await _context.Users
                .Include(x => x.UserProfile)
                .Skip(page * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // PATCH: api/Users/0/PagePreference/5
        [HttpPatch("{id}/PagePreference/{pref}")]
        public async Task<ActionResult<UserDTO>> PatchPreference(long id, long pref)
        {
            if (_context.Users == null)
                return NotFound();

            if (pref < 0 || pref > 100)
                return BadRequest("Preference must be between 0 and 100.");

            var user = await _context.Users
                .Include(x => x.UserProfile)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (user == null)
                return NotFound();

            var extracted = ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            if (extracted.Item2 < AccessLevel.Admin && user.Id != extracted.Item1)
                return Unauthorized("You can only update your own preferences.");

            user.UserProfile.PagePreference = pref;
            await _context.SaveChangesAsync();

            var userDTO = UserToDTO(user);
            userDTO.Password = null;

            return userDTO;
        }

        // PATCH: api/Users/0/PagePreferences/5
        [HttpPatch("PagePreferences/{pref}")]
        [Role(AccessLevel.Admin)]
        public async Task<ActionResult<UserDTO>> PatchPreferences(long pref)
        {
            if (_context.UserProfiles == null)
                return NotFound();

            if (pref < 0 || pref > 100)
                return BadRequest("Preference must be between 0 and 100.");

            long count = await _context.UserProfiles
                .CountAsync();

            var parameter = new SqlParameter("@PagePreference", pref);
            await _context.Database.ExecuteSqlRawAsync("UPDATE [UserProfiles] SET [PagePreference] = @PagePreference", parameter);
            
            return Ok($"Updated {count} users with the new preference.");
        }

        // PATCH: api/Users/0/PagePreference/5
        [HttpPatch("{id}/AccessLevel/{accessLevel}")]
        [Role(AccessLevel.Admin)]
        public async Task<ActionResult<UserDTO>> PatchAccessLevel(long id, AccessLevel accessLevel)
        {
            if (_context.Users == null)
                return NotFound();

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == id);
            if (user == null)
                return NotFound();

            user.AccessLevel = accessLevel;
            await _context.SaveChangesAsync();

            var userDTO = UserToDTO(user);
            userDTO.Password = null;

            return userDTO;
        }

        // GET: api/Users
        [HttpGet]
        [Role(AccessLevel.Admin)]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            if (_context.Users == null)
                return NotFound();

            return await _context.Users
                .Select(x => UserToDTO(x))
                .ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<UserProfileDTO>> GetUser(long id)
        {
            if (_context.Users == null)
                return NotFound();

            var user = await _context.Users
                .Include(x => x.UserProfile)
                .FirstOrDefaultAsync(x => x.Id == id);
                //.FindAsync(id);
            if (user == null)
                return NotFound();

            int roleCount = await _context.StoreEmployeeRoles
                .Where(x => x.UserId == id)
                .CountAsync();

            int employeeCount = await _context.StoreEmployees
                .Where(x => x.UserId == id)
                .CountAsync();

            int storeCount = await _context.Stores
                .Where(x => x.UserId == id)
                .CountAsync();

            int shiftCount = await _context.StoreShifts
                .Where(x => x.UserId == id)
                .CountAsync();

            var userProfileDTO = new UserProfileDTO
            {
                Id = user.Id,
                Name = user.Name,
                Password = null,

                AccessLevel = user.AccessLevel,
                UserProfile = user.UserProfile,

                RoleCount = roleCount,
                EmployeeCount = employeeCount,
                StoreCount = storeCount,
                ShiftCount = shiftCount
            };

            return userProfileDTO;
        }

        // GET: api/Users/search?query=johndoe
        [HttpGet("search")]
        [Role(AccessLevel.Admin)]
        public async Task<ActionResult<IEnumerable<UserDTO>>> SearchUsers(string query)
        {
            if (_context.Users == null)
                return NotFound();

            if (query.Length < 3)
                return NotFound();

            return await _context.Users
                .Where(x => x.Name != null && x.Name.ToLower().Contains(query.ToLower()))
                .Select(x => UserToDTO(x))
                .Take(100)
                .ToListAsync();
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> PutUser(long id, UserDTO userDTO)
        {
            if (id != userDTO.Id)
                return BadRequest();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Name = userDTO.Name;
            user.Password = userDTO.Password;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!UserExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Role(AccessLevel.Admin)]
        public async Task<ActionResult<UserDTO>> PostUser(UserDTO userDTO)
        {
            if (_context.Users == null)
                return Problem("Entity set 'StoreContext.Users' is null.");

            var user = new User
            {
                Name = userDTO.Name,
                Password = userDTO.Password,
                AccessLevel = AccessLevel.Unconfirmed,

                UserProfile = new UserProfile
                {

                },
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                UserToDTO(user));
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> DeleteUser(long id)
        {
            if (_context.Users == null)
                return NotFound();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Users/StoreEmployeeRoles/5
        [HttpDelete("StoreEmployeeRoles/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> DeleteRoles(int count)
        {
            var parameter = new SqlParameter("@Count", count);
            int affected = await _context.Database.ExecuteSqlRawAsync("DELETE TOP(@Count) FROM [StoreEmployeeRoles]", parameter);
            
            return Ok($"Deleted {affected} store employee roles.");
        }

        // DELETE: api/Users/StoreEmployees/5
        [HttpDelete("StoreEmployees/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> DeleteEmployees(int count)
        {
            var parameter = new SqlParameter("@Count", count);
            int affected = await _context.Database.ExecuteSqlRawAsync("DELETE TOP(@Count) FROM [StoreEmployees]", parameter);

            return Ok($"Deleted {affected} store employees.");
        }

        // DELETE: api/Users/Stores/5
        [HttpDelete("Stores/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> DeleteStores(int count)
        {
            var parameter = new SqlParameter("@Count", count);
            int affected = await _context.Database.ExecuteSqlRawAsync("DELETE TOP(@Count) FROM [Stores]", parameter);

            return Ok($"Deleted {affected} stores.");
        }

        // DELETE: api/Users/StoreShifts/5
        [HttpDelete("StoreShifts/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> DeleteShifts(int count)
        {
            var parameter = new SqlParameter("@Count", count);
            int affected = await _context.Database.ExecuteSqlRawAsync("DELETE TOP(@Count) FROM [StoreShifts]", parameter);

            return Ok($"Deleted {affected} store shifts.");
        }

        // POST: api/Users/StoreEmployeeRoles/5
        [HttpPost("StoreEmployeeRoles/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> SeedEmployeeRoles(int count)
        {
            var extracted = ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            await SeedData.SeedEmployeeRolesAsync(_context, count, extracted.Item1);
            return Ok($"Generated {count} store employee roles.");
        }

        // POST: api/Users/StoreEmployees/5
        [HttpPost("StoreEmployees/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> SeedEmployees(int count)
        {
            var extracted = ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            await SeedData.SeedEmployeesAsync(_context, count, extracted.Item1);
            return Ok($"Generated {count} store employees.");
        }

        // POST: api/Users/Stores/5
        [HttpPost("Stores/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> SeedStores(int count)
        {
            var extracted = ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            await SeedData.SeedStoresAsync(_context, count, extracted.Item1);
            return Ok($"Generated {count} stores.");
        }

        // POST: api/Users/StoreShifts/5
        [HttpPost("StoreShifts/{count}")]
        [Role(AccessLevel.Admin)]
        public async Task<IActionResult> SeedShifts(int count)
        {
            var extracted = ExtractJWTToken(User);
            if (extracted == null)
                return Unauthorized("Invalid token.");

            await SeedData.SeedStoreShiftsAsync(_context, count, extracted.Item1);
            return Ok($"Generated {count} store shifts.");
        }

        private bool UserExists(long id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        private static UserDTO UserToDTO(User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Password = user.Password,
            };
        }

        public static Tuple<long, AccessLevel>? ExtractJWTToken(ClaimsPrincipal claimsPrincipal)
        {
            var userIdClaim = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out long userId))
                return null;

            var accessLevelClaim = claimsPrincipal.FindFirst(ClaimTypes.Role);
            if (accessLevelClaim == null || !Enum.TryParse<AccessLevel>(accessLevelClaim.Value, out var userAccessLevel))
                return null;

            return new Tuple<long, AccessLevel>(userId, userAccessLevel);
        }
    }
}
