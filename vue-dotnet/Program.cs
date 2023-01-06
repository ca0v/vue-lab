using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using vue_dotnet.MyDbContext;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<MyTableContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("MyTableContext") ?? throw new InvalidOperationException("Connection string 'MyTableContext' not found.")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// also support Razor Pages
builder.Services.AddRazorPages();


var app = builder.Build();

// also support static content, this is where Vue pages will go
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// use Razor Pages
app.UseRouting();

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapRazorPages(); // critical to get Pages to show
});

app.MapControllers();

app.Run();
