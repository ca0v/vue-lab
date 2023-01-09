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
    public partial class CrewController : ControllerBase
    {
        private readonly MovieContext _context;

        public CrewController(MovieContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<Crew>>> GetCrew(string id)
        {
            if (_context.Crews == null)
            {
                return NotFound();
            }
            var crew = await _context.Crews.Where(c => c.TitleId == id).ToListAsync();

            if (crew == null)
            {
                return NotFound();
            }

            return injectPerson(crew);
        }

        private ActionResult<IEnumerable<Crew>> injectPerson(List<Crew> crew)
        {
            var data = crew.Select(c =>
            {
                var person = _context.People.Find(c.PersonId);
                Console.WriteLine($"{c.PersonId} -> {person?.Name}");
                c.Person = person;
                return c;
            }).ToList();

            return data;
        }
    }
}

