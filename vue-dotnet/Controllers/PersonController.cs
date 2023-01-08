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
    public partial class PersonController : ControllerBase
    {
        private readonly MovieContext _context;

        public PersonController(MovieContext context)
        {
            _context = context;
        }

        // GET: api/Person
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Person>>> GetPeople()
        {
            if (_context.People == null)
            {
                return NotFound();
            }
            return await _context.People.OrderBy(p => p.Name).Take(10).ToListAsync();
        }

        // GET: api/Person/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Person>> GetPerson(string id)
        {
            if (_context.People == null)
            {
                return NotFound();
            }
            var person = await _context.People.FindAsync(id);

            if (person == null)
            {
                return NotFound();
            }

            return person;
        }

        // PUT: api/Person/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPerson(string id, Person person)
        {
            if (id != person.PersonId)
            {
                return BadRequest();
            }

            _context.Entry(person).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonExists(id))
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

        // POST: api/Person
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Person>> PostPerson(Person person)
        {
            if (_context.People == null)
            {
                return Problem("Entity set 'MovieContext.People'  is null.");
            }
            _context.People.Add(person);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PersonExists(person.PersonId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetPerson", new { id = person.PersonId }, person);
        }

        // DELETE: api/Person/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerson(string id)
        {
            if (_context.People == null)
            {
                return NotFound();
            }
            var person = await _context.People.FindAsync(id);
            if (person == null)
            {
                return NotFound();
            }

            _context.People.Remove(person);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PersonExists(string id)
        {
            return (_context.People?.Any(e => e.PersonId == id)).GetValueOrDefault();
        }
    }
}

namespace vue_dotnet.Controllers
{
    public partial class PersonController
    {

        [HttpGet("{id}/movies")]
        public async Task<ActionResult<IEnumerable<Title>>> GetMovies(string id)
        {
            var person = await _context.People.FindAsync(id);
            if (person == null)
            {
                return NotFound();
            }
            var titleIds = await _context.Crews.Where(c => c.PersonId == id)
            .Select(c => c.TitleId)
            .ToListAsync();

            var titles = await _context.Titles
            .Where(t => titleIds.Contains(t.TitleId)).Select(t => t)
            .ToListAsync();

            return titles!;
        }
    }
}