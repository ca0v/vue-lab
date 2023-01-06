using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using vue_dotnet.MyDbContext;

namespace vue_dotnet.Pages.MyDatabase
{
    public class IndexModel : PageModel
    {
        private readonly vue_dotnet.MyDbContext.MyTableContext _context;

        public IndexModel(vue_dotnet.MyDbContext.MyTableContext context)
        {
            _context = context;
        }

        public IList<MyTable> MyTable { get;set; } = default!;

        public async Task OnGetAsync()
        {
            if (_context.MyTable != null)
            {
                MyTable = await _context.MyTable.ToListAsync();
            }
        }
    }
}
