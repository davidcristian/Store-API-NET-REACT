namespace StoreAPI.Models
{
    public class StoreShift
    {
        public virtual DateTime? StartDate { get; set; }
        public virtual DateTime? EndDate { get; set; }
     
        public virtual long StoreId { get; set; }
        public virtual long StoreEmployeeId { get; set; }

        // Hidden from the API because it's not in the DTO
        public virtual Store Store { get; set; }
        public virtual StoreEmployee StoreEmployee { get; set; }

        public virtual long? UserId { get; set; }
        public virtual User? User { get; set; }
    }
}
