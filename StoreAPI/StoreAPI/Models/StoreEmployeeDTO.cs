namespace StoreAPI.Models
{
    public class StoreEmployeeDTO
    {
        public long Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        public Gender Gender { get; set; }

        public DateTime? EmploymentDate { get; set; }
        public DateTime? TerminationDate { get; set; }
        public double Salary { get; set; }

        public long? StoreEmployeeRoleId { get; set; }
    }
}
