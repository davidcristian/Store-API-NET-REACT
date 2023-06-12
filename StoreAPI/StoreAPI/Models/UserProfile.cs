namespace StoreAPI.Models
{
    public enum MaritalStatus
    {
        Single,
        Married,
        Widowed,
        Separated,
        Divorced
    }

    public class UserProfile
    {
        public virtual long? UserId { get; set; }
        public virtual User User { get; set; } = null!;
        
        public virtual string? Bio { get; set; }
        public virtual string? Location { get; set; }
        
        public virtual DateTime? Birthday { get; set; }
        public virtual Gender Gender { get; set; }
        public virtual MaritalStatus MaritalStatus { get; set; }

        public virtual long PagePreference { get; set; }
    }
}
