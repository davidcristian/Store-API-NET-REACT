namespace StoreAPI.Models
{
    public class StoreShiftEmployeesDTO
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    
        public List<long> StoreEmployeeIds { get; set; } = null!;
    }
}
