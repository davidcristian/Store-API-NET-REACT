namespace StoreAPI.Models
{
    public enum AccessLevel
    {
        Unconfirmed,
        Regular,
        Moderator,
        Admin
    }

    public class User
    {
        public virtual long Id { get; set; }
        public virtual string? Name { get; set; }
        public virtual string? Password { get; set; }

        // Hidden from the API because it's not in the DTO
        public virtual AccessLevel AccessLevel { get; set; }
        public virtual UserProfile UserProfile { get; set; } = null!;
    }
}
