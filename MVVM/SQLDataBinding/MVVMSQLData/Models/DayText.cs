using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MVVMSQLData.Models
{
    [Table("tblDayText")]
    public class DayText
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string DayTextStr { get; set; }
    }
}
