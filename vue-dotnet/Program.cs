using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using vue_dotnet.MyDbContext;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<MyTableContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("MyTableContext") ?? throw new InvalidOperationException("Connection string 'MyTableContext' not found.")));

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

app.UseEndpoints(endpoints =>
{
    endpoints.MapRazorPages(); // critical to get Pages to show
});

// read "AllowedOrigins" from appsettings.json
var origins = builder.Configuration.GetValue<string>("AllowedOrigins")?.Split(';');
if (origins == null)
{
    throw new Exception("Cors whitelist not found in appsettings.json");
}

app.UseCors(policy => policy.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader().WithExposedHeaders("*"));


app.MapControllers();

app.Run();
