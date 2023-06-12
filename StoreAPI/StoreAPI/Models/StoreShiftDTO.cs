namespace StoreAPI.Models
{
    public class StoreShiftDTO
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public long StoreId { get; set; }
        public long StoreEmployeeId { get; set; }
    }
}
