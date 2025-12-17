using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// DATABASE
builder.Services.AddDbContext<LibraryUserContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("LibraryDb");
    options.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

// HTTP CLIENT
builder.Services.AddHttpClient();

// SWAGGER
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowVite");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// USERS
app.MapGet("/api/users", async (LibraryUserContext db) =>
    await db.Users.ToListAsync());

app.MapPost("/api/users/login", async (LoginRequest req, LibraryUserContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u =>
        u.Username == req.Username &&
        u.Password == req.Password &&
        u.Status == "ACTIVE");

    return user is null ? Results.Unauthorized() : Results.Ok(user);
});

// ADMINS
app.MapPost("/api/admins/login", async (LoginRequest req, LibraryUserContext db) =>
{
    var admin = await db.Admins.FirstOrDefaultAsync(a =>
        a.Username == req.Username &&
        a.Password == req.Password &&
        a.Status == "ACTIVE");

    return admin is null ? Results.Unauthorized() : Results.Ok(admin);
});

// ===============================
// ✅ MEMBERS (WITH STATUS JOIN)
// ===============================
app.MapGet("/api/members", async (LibraryUserContext db) =>
{
    return await db.Members
        .Join(
            db.Users,
            m => m.UserId,
            u => u.UserId,
            (m, u) => new
            {
                memberId = m.MemberId,
                userId = m.UserId,
                membershipDate = m.MembershipDate,
                status = u.Status
            }
        )
        .ToListAsync();
});

app.MapPost("/api/members", async (Member member, LibraryUserContext db) =>
{
    member.MembershipDate = DateTime.UtcNow;
    db.Members.Add(member);
    await db.SaveChangesAsync();
    return Results.Created($"/api/members/{member.MemberId}", member);
});

// ===============================
// ✅ USER REGISTRATION
// ===============================
app.MapPost("/api/users", async (User user, LibraryUserContext db) =>
{
    bool exists = await db.Users.AnyAsync(u => u.Username == user.Username);
    if (exists)
        return Results.Conflict($"Username '{user.Username}' already exists.");

    user.CreatedAt = DateTime.UtcNow;
    user.Status = "ACTIVE";

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Created($"/api/users/{user.UserId}", user);
});


// ===============================
// ✅ DELETE MEMBER (TRUE SOFT DELETE)
// ===============================
app.MapDelete("/api/members/{id:int}", async (
    int id,
    LibraryUserContext db,
    IHttpClientFactory httpClientFactory,
    IConfiguration config) =>
{
    var member = await db.Members.FindAsync(id);
    if (member == null)
        return Results.NotFound("Member not found");

    // ---- SAFE catalog-service check ----
    try
    {
        var client = httpClientFactory.CreateClient();
        var catalogBase =
            config["CatalogService:BaseUrl"] ?? "http://localhost:8080";

        var resp = await client.GetAsync(
            $"{catalogBase}/api/catalog/borrows/active/member/{id}");

        if (resp.IsSuccessStatusCode)
            return Results.Conflict("Member has active borrowed books");
    }
    catch
    {
        // ignore catalog-service issues
    }

    // ✅ TRUE SOFT DELETE
    var user = await db.Users.FindAsync(member.UserId);
    if (user != null)
        user.Status = "INACTIVE";

    await db.SaveChangesAsync();
    return Results.Ok("Member deactivated successfully");
});

// ===============================
// ♻️ RESTORE MEMBER
// ===============================
app.MapPost("/api/members/{id:int}/restore", async (int id, LibraryUserContext db) =>
{
    var member = await db.Members.FindAsync(id);
    if (member == null)
        return Results.BadRequest("Member not found");

    var user = await db.Users.FindAsync(member.UserId);
    if (user == null)
        return Results.NotFound("User not found");

    user.Status = "ACTIVE";

    await db.SaveChangesAsync();
    return Results.Ok("Member restored");
});

app.Run();

record LoginRequest(string Username, string Password);
