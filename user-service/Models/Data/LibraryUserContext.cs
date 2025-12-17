using Microsoft.EntityFrameworkCore;
using UserService.Models;

namespace UserService.Data;

public class LibraryUserContext : DbContext
{
    public LibraryUserContext(DbContextOptions<LibraryUserContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Member> Members => Set<Member>();

    // ✅ ADMIN AUDIT LOGS
    public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();
}
