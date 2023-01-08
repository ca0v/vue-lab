using System;
using System.Collections.Generic;

namespace vue_dotnet.ImdbContext;

public partial class People
{
    public string PersonId { get; set; } = null!;

    public string? Name { get; set; }

    public long? Born { get; set; }

    public long? Died { get; set; }
}
