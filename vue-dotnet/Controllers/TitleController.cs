using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Contexts;

namespace vue_dotnet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TitleController : ControllerBase
    {
        private readonly MovieContext _context;

        public TitleController(MovieContext context)
        {
            _context = context;
        }

        // GET: api/Title
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Title>>> GetTitles()
        {
            if (_context.Titles == null)
            {
                return NotFound();
            }
            return await _context.Titles.Take(10).ToListAsync();
        }

        // GET: api/Title/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Title>> GetTitle(string id)
        {
            if (_context.Titles == null)
            {
                return NotFound();
            }
            var title = await _context.Titles.FindAsync(id);

            if (title == null)
            {
                return NotFound();
            }

            return title;
        }

        // PUT: api/Title/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTitle(string id, Title title)
        {
            if (id != title.TitleId)
            {
                return BadRequest();
            }

            _context.Entry(title).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TitleExists(id))
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

        // POST: api/Title
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Title>> PostTitle(Title title)
        {
            if (_context.Titles == null)
            {
                return Problem("Entity set 'MovieContext.Titles'  is null.");
            }
            _context.Titles.Add(title);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TitleExists(title.TitleId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTitle", new { id = title.TitleId }, title);
        }

        // DELETE: api/Title/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTitle(string id)
        {
            if (_context.Titles == null)
            {
                return NotFound();
            }
            var title = await _context.Titles.FindAsync(id);
            if (title == null)
            {
                return NotFound();
            }

            _context.Titles.Remove(title);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TitleExists(string id)
        {
            return (_context.Titles?.Any(e => e.TitleId == id)).GetValueOrDefault();
        }
    }
}
