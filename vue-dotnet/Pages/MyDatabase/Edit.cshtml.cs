using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using vue_dotnet.MyDbContext;

namespace vue_dotnet.Pages.MyDatabase
{
    public class EditModel : PageModel
    {
        private readonly vue_dotnet.MyDbContext.MyTableContext _context;

        public EditModel(vue_dotnet.MyDbContext.MyTableContext context)
        {
            _context = context;
        }

        [BindProperty]
        public MyTable MyTable { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(long? id)
        {
            if (id == null || _context.MyTable == null)
            {
                return NotFound();
            }

            var mytable =  await _context.MyTable.FirstOrDefaultAsync(m => m.Id == id);
            if (mytable == null)
            {
                return NotFound();
            }
            MyTable = mytable;
            return Page();
        }

        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(MyTable).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MyTableExists(MyTable.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return RedirectToPage("./Index");
        }

        private bool MyTableExists(long id)
        {
          return (_context.MyTable?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
