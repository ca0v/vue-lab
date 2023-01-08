using System;
using System.Collections.Generic;

namespace vue_dotnet.ImdbContext;

public partial class Episodes
{
    public string? EpisodeTitleId { get; set; }

    public string? ShowTitleId { get; set; }

    public long? SeasonNumber { get; set; }

    public long? EposideNumber { get; set; }
}
