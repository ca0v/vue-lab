using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vue_dotnet.MyDbContext;

namespace vue_dotnet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MyDatabaseController : ControllerBase
    {
        private readonly MyTableContext _context;

        public MyDatabaseController(MyTableContext context)
        {
            _context = context;
        }

        // GET: api/MyDatabase
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MyTable>>> GetMyTable()
        {
          if (_context.MyTable == null)
          {
              return NotFound();
          }
            return await _context.MyTable.ToListAsync();
        }

        // GET: api/MyDatabase/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MyTable>> GetMyTable(long id)
        {
          if (_context.MyTable == null)
          {
              return NotFound();
          }
            var myTable = await _context.MyTable.FindAsync(id);

            if (myTable == null)
            {
                return NotFound();
            }

            return myTable;
        }

        // PUT: api/MyDatabase/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMyTable(long id, MyTable myTable)
        {
            if (id != myTable.Id)
            {
                return BadRequest();
            }

            _context.Entry(myTable).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MyTableExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/MyDatabase
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<MyTable>> PostMyTable(MyTable myTable)
        {
          if (_context.MyTable == null)
          {
              return Problem("Entity set 'MyTableContext.MyTable'  is null.");
          }
            _context.MyTable.Add(myTable);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMyTable", new { id = myTable.Id }, myTable);
        }

        // DELETE: api/MyDatabase/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMyTable(long id)
        {
            if (_context.MyTable == null)
            {
                return NotFound();
            }
            var myTable = await _context.MyTable.FindAsync(id);
            if (myTable == null)
            {
                return NotFound();
            }

            _context.MyTable.Remove(myTable);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MyTableExists(long id)
        {
            return (_context.MyTable?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
