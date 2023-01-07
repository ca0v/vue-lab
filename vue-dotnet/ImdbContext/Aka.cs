using System;
using System.Collections.Generic;

namespace vue_dotnet.ImdbContext;

public partial class Aka
{
    public string? TitleId { get; set; }

    public string? Title { get; set; }

    public string? Region { get; set; }

    public string? Language { get; set; }

    public string? Types { get; set; }

    public string? Attributes { get; set; }

    public long? IsOriginalTitle { get; set; }
}
