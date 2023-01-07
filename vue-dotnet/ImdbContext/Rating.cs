using System;
using System.Collections.Generic;

namespace vue_dotnet.ImdbContext;

public partial class Rating
{
    public string TitleId { get; set; } = null!;

    public long? Rating1 { get; set; }

    public long? Votes { get; set; }
}
