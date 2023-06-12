namespace StoreAPI.Models
{
    public class StoreDTO
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }

        public StoreCategory Category { get; set; }
        public string? Address { get; set; }

        public string? City { get; set; }
        public string? State { get; set; }

        public string? ZipCode { get; set; }
        public string? Country { get; set; }

        public DateTime? OpenDate { get; set; }
        public DateTime? CloseDate { get; set; }
    }
}
