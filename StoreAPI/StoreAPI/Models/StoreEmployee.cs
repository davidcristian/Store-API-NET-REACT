namespace StoreAPI.Models
{
    public enum Gender
    {
        Female,
        Male,
        Other
    }

    public class StoreEmployee
    {
        public virtual long Id { get; set; }
        public virtual string? FirstName { get; set; }
        public virtual string? LastName { get; set; }

        public virtual Gender Gender { get; set; }

        public virtual DateTime? EmploymentDate { get; set; }
        public virtual DateTime? TerminationDate { get; set; }
        public virtual double Salary { get; set; }

        public virtual long? StoreEmployeeRoleId { get; set; }

        // Hidden from the API because it's not in the DTO
        public virtual StoreEmployeeRole? StoreEmployeeRole { get; set; } = null!;
        public virtual ICollection<StoreShift> StoreShifts { get; set; } = null!;

        public virtual long? UserId { get; set; }
        public virtual User? User { get; set; } = null!;
    }
}
