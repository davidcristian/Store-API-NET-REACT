namespace StoreAPI.Models
{
    public class StoreHeadcountReportDTO
    {
        public virtual long Id { get; set; }
        public virtual string? Name { get; set; }
        public virtual string? Description { get; set; }

        public virtual StoreCategory Category { get; set; }
        public virtual string? Address { get; set; }

        public virtual string? City { get; set; }
        public virtual string? State { get; set; }

        public virtual string? ZipCode { get; set; }
        public virtual string? Country { get; set; }

        public virtual DateTime? OpenDate { get; set; }
        public virtual DateTime? CloseDate { get; set; }

        public virtual long Headcount { get; set; }
    }
}
