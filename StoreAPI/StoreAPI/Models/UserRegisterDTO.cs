namespace StoreAPI.Models
{
    public class UserRegisterDTO
    {
        public virtual string? Name { get; set; }
        public virtual string? Password { get; set; }

        public virtual string? Bio { get; set; }
        public virtual string? Location { get; set; }

        public virtual DateTime? Birthday { get; set; }
        public virtual Gender Gender { get; set; }
        public virtual MaritalStatus MaritalStatus { get; set; }
    }
}
