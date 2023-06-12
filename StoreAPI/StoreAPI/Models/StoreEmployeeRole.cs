namespace StoreAPI.Models
{
    public class StoreEmployeeRole
    {
        public virtual long Id { get; set; }
        public virtual string? Name { get; set; }
        public virtual string? Description { get; set; }

        public virtual long RoleLevel { get; set; }

        // Hidden from the API because it's not in the DTO
        public virtual ICollection<StoreEmployee> StoreEmployees { get; set; } = null!;

        public virtual long? UserId { get; set; }
        public virtual User? User { get; set; } = null!;
    }
}
