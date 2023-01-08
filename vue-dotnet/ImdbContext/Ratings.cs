using System;
using System.Collections.Generic;

namespace vue_dotnet.ImdbContext;

public partial class Ratings
{
    public string TitleId { get; set; } = null!;

    public long? Rating { get; set; }

    public long? Votes { get; set; }
}
