namespace StoreAPI.Models
{
    public enum StoreCategory
    {
        General,
        Food,
        Clothing,
        Electronics,
        Furniture
    }

    public class Store
    {
        public virtual long Id { get; set; }
        public virtual string? Name { get; set; }
        public virtual string? Description { get; set; }

        public virtual StoreCategory Category { get; set; }
        public virtual string? Address { get; set; }

        public virtual string? City { get; set; }
        public virtual string? State { get; set; }

        // ZIP codes can start with 0, unfortunately
        public virtual string? ZipCode { get; set; }
        public virtual string? Country { get; set; }

        public virtual DateTime? OpenDate { get; set; }
        public virtual DateTime? CloseDate { get; set; }

        // Hidden from the API because it's not in the DTO
        public virtual ICollection<StoreShift> StoreShifts { get; set; } = null!;

        public virtual long? UserId { get; set; }
        public virtual User? User { get; set; } = null!;
    }
}
