namespace StoreAPI.Models
{
    public class ChatMessage
    {
        public virtual long Id { get; set; }
        public virtual DateTime? Timestamp { get; set; }
     
        public virtual string? Nickname { get; set; }
        public virtual string? Message { get; set; }
    }
}
