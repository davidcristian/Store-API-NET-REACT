using StoreAPI.Models;

namespace StoreAPI.Validators
{
    public class UserValidator
    {
        public UserValidator() { }

        public string ValidateRegister(UserRegisterDTO user)
        {
            List<string> errors = new List<string>();

            if (user == null)
                return "User must not be null.";

            if (user.Password == null || user.Password.Length < 8)
                errors.Add("Password must contain at least 8 characters.");
            if (user.Password == null || !user.Password.Any(char.IsLetter) || !user.Password.Any(char.IsDigit))
                errors.Add("Password must contain at least a letter and a number.");

            if (user.Name == null || user.Name.Length < 3)
                errors.Add("Name must have a length greater than 2 characters.");
            if (user.Bio == null || user.Bio.Length < 3)
                errors.Add("Bio must have a length greater than 2 characters.");
            if (user.Location == null || user.Location.Length < 3)
                errors.Add("Location must a length greater than 2 characters.");

            return string.Join("\n", errors);
        }
    }
}
