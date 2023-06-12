namespace StoreAPI.Models
{
    public class UserProfileDTO
    {
        public virtual long Id { get; set; }
        public virtual string? Name { get; set; }
        public virtual string? Password { get; set; }

        public virtual AccessLevel AccessLevel { get; set; }
        public virtual UserProfile UserProfile { get; set; } = null!;

        public virtual int RoleCount { get; set; }
        public virtual int EmployeeCount { get; set; }
        public virtual int StoreCount { get; set; }
        public virtual int ShiftCount { get; set; }
    }
}
