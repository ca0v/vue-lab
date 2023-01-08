using System;
using System.Collections.Generic;

namespace Contexts;

public partial class Episode
{
    public string? EpisodeTitleId { get; set; }

    public string? ShowTitleId { get; set; }

    public long? SeasonNumber { get; set; }

    public long? EposideNumber { get; set; }
}
