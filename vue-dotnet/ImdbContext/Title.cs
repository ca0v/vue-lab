using System;
using System.Collections.Generic;

namespace vue_dotnet.ImdbContext;

public partial class Title
{
    public string TitleId { get; set; } = null!;

    public string? Type { get; set; }

    public string? PrimaryTitle { get; set; }

    public string? OriginalTitle { get; set; }

    public long? IsAdult { get; set; }

    public long? Premiered { get; set; }

    public long? Ended { get; set; }

    public long? RuntimeMinutes { get; set; }

    public string? Genres { get; set; }
}
