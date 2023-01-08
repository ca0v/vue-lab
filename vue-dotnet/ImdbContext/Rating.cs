using System;
using System.Collections.Generic;

namespace Contexts;

public partial class Rating
{
    public string TitleId { get; set; } = null!;

    public long? Rating1 { get; set; }

    public long? Votes { get; set; }
}
