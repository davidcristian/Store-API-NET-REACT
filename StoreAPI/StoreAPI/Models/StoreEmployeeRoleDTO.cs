namespace StoreAPI.Models
{
    public class StoreEmployeeRoleDTO
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }

        public long RoleLevel { get; set; }
    }
}
