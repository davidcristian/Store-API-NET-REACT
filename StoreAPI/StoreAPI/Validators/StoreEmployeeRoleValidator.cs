using StoreAPI.Models;

namespace StoreAPI.Validators
{
    public class StoreEmployeeRoleValidator
    {
        public StoreEmployeeRoleValidator() { }

        public string Validate(StoreEmployeeRoleDTO role)
        {
            List<string> errors = new List<string>();

            if (role == null)
                return "Role must not be null.";

            if (role.Name == null || role.Name.Length < 3)
                errors.Add("Name must have a length greater than 2 characters.");
            if (role.Description == null || role.Description.Length < 3)
                errors.Add("Description must have a length greater than 2 characters.");
            if (role.RoleLevel < 0)
                errors.Add("Role level must be greater than or equal to zero.");

            return string.Join("\n", errors);
        }
    }
}
