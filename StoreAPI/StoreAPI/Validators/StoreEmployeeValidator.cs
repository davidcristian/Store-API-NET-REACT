using StoreAPI.Models;

namespace StoreAPI.Validators
{
    public class StoreEmployeeValidator
    {
        public StoreEmployeeValidator() { }

        public string Validate(StoreEmployeeDTO employee)
        {
            List<string> errors = new List<string>();

            if (employee == null)
                return "Employee must not be null.";

            if (employee.FirstName == null || employee.FirstName.Length < 3)
                errors.Add("First name must have a length greater than 2 characters.");
            if (employee.LastName == null || employee.LastName.Length < 3)
                errors.Add("Last name must have a length greater than 2 characters.");
            if (employee.Salary < 0)
                errors.Add("Salary must be greater than or equal to zero.");

            return string.Join("\n", errors);
        }
    }
}
