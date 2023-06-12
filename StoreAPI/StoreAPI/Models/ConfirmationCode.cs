namespace StoreAPI.Models
{
    public class ConfirmationCode
    {
        public virtual long? Id { get; set; }

        public virtual long? UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public virtual string? Code { get; set; }
        public virtual DateTime? Expiration { get; set; }
        public virtual bool Used { get; set; }
    }
}
