using System;
using System.Collections.Generic;

namespace Contexts;

public partial class Person
{
    public string PersonId { get; set; } = null!;

    public string? Name { get; set; }

    public long? Born { get; set; }

    public long? Died { get; set; }
}
