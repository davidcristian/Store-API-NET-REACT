namespace StoreAPI.Models
{
    public class UserDTO
    {
        public virtual long Id { get; set; }
        public virtual string? Name { get; set; }
        public virtual string? Password { get; set; }
    }
}
