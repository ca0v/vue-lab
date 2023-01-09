using System;
using System.Collections.Generic;

namespace Contexts;

public partial class Crew
{
    public string? TitleId { get; set; }

    public string? PersonId { get; set; }

    public string? Category { get; set; }

    public string? Job { get; set; }

    public string? Characters { get; set; }
}

public partial class Crew
{
    public virtual Person? Person { get; set; }
}