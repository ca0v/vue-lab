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
    public class DetailsModel : PageModel
    {
        private readonly vue_dotnet.MyDbContext.MyTableContext _context;

        public DetailsModel(vue_dotnet.MyDbContext.MyTableContext context)
        {
            _context = context;
        }

      public MyTable MyTable { get; set; } = default!; 

        public async Task<IActionResult> OnGetAsync(long? id)
        {
            if (id == null || _context.MyTable == null)
            {
                return NotFound();
            }

            var mytable = await _context.MyTable.FirstOrDefaultAsync(m => m.Id == id);
            if (mytable == null)
            {
                return NotFound();
            }
            else 
            {
                MyTable = mytable;
            }
            return Page();
        }
    }
}
