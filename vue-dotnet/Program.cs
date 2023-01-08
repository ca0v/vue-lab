using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using vue_dotnet.MyDbContext;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<MyTableContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("MyTableContext") ?? throw new InvalidOperationException("Connection string 'MyTableContext' not found.")));

builder.Services.AddDbContext<Contexts.MovieContext>();

// Add services to the container.

builder.Services.AddControllers();

// support CORS
builder.Services.AddCors();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// also support Razor Pages
builder.Services.AddRazorPages();

// allow CORS on http://localhost:5173
builder.Services.AddCors();

var app = builder.Build();

// also support static content, this is where Vue pages will go
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// to enable endpoint registration for Razor Pages
app.UseRouting();

app.UseHttpsRedirection();

app.UseAuthorization();

// useCors must be called after UseRouting and before UseEndpoints
// why? Tell me copilot:
// https://docs.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-5.0#enable-cors-with-endpoint-routing
// which simply states it as a fact:
// "With endpoint routing, the CORS middleware must be configured to execute between the calls to UseRouting and UseEndpoints."
// Let's see, routing is obviously before endpoints
// and if cors is after routing, it cannot get called
// if CORS were before routing the headers may get overwritten

{
    // read "AllowedOrigins" from appsettings.json
    var origins = builder.Configuration.GetValue<string>("AllowedOrigins")?.Split(';');
    if (origins == null)
    {
        throw new Exception("Cors whitelist not found in appsettings.json");
    }
    app.UseCors(policy =>
        policy.WithOrigins(origins)
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("*")
        );
}

app.UseEndpoints(endpoints =>
{
    endpoints.MapRazorPages(); // critical to get Pages to show
});

app.MapControllers();

app.Run();
