using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models;

[Table("members")]
public class Member
{
    [Key]
    [Column("member_id")]
    public int MemberId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("membership_date")]
    public DateTime MembershipDate { get; set; }
}
