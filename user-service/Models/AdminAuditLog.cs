using System.ComponentModel.DataAnnotations;

namespace UserService.Models;

public class AdminAuditLog
{
    [Key]
    public int Id { get; set; }

    public int AdminId { get; set; }

    public string Action { get; set; } = "";

    public DateTime CreatedAt { get; set; }
}
