using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using vue_dotnet.MyDbContext;

namespace vue_dotnet.Pages.MyDatabase
{
    public class CreateModel : PageModel
    {
        private readonly vue_dotnet.MyDbContext.MyTableContext _context;

        public CreateModel(vue_dotnet.MyDbContext.MyTableContext context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public MyTable MyTable { get; set; } = default!;
        

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostAsync()
        {
          if (!ModelState.IsValid || _context.MyTable == null || MyTable == null)
            {
                return Page();
            }

            _context.MyTable.Add(MyTable);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
