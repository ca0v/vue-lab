using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace vue_dotnet.MyDbContext
{
    public class MyTableContext : DbContext
    {
        public MyTableContext (DbContextOptions<MyTableContext> options)
            : base(options)
        {
        }

        public DbSet<vue_dotnet.MyDbContext.MyTable> MyTable { get; set; } = default!;
    }
}
