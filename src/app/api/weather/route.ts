import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip");

  if (!zip) {
    return NextResponse.json({ error: "Zip code is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Get coordinates from zip code
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${apiKey}`
    );

    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "Invalid zip code or location not found" },
        { status: 404 }
      );
    }

    const geoData = await geoRes.json();
    const { lat, lon, name } = geoData;

    // Get 7-day forecast using One Call API 3.0
    // Falls back to 5-day/3-hour forecast (free tier)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    );

    if (!forecastRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch forecast" },
        { status: 502 }
      );
    }

    const forecastData = await forecastRes.json();

    // Aggregate 3-hour intervals into daily forecasts
    const dailyMap = new Map<
      string,
      { temps: number[]; icons: string[]; descriptions: string[]; dt: number }
    >();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toISOString().split("T")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          temps: [],
          icons: [],
          descriptions: [],
          dt: item.dt,
        });
      }
      const day = dailyMap.get(date)!;
      day.temps.push(item.main.temp);
      day.icons.push(item.weather[0].icon);
      day.descriptions.push(item.weather[0].description);
    }

    const daily = Array.from(dailyMap.entries())
      .slice(0, 7)
      .map(([date, data]) => {
        // Pick the most frequent icon
        const iconCounts = data.icons.reduce(
          (acc: Record<string, number>, icon) => {
            acc[icon] = (acc[icon] || 0) + 1;
            return acc;
          },
          {}
        );
        const mainIcon = Object.entries(iconCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        // Pick the most frequent description
        const descCounts = data.descriptions.reduce(
          (acc: Record<string, number>, d) => {
            acc[d] = (acc[d] || 0) + 1;
            return acc;
          },
          {}
        );
        const mainDesc = Object.entries(descCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        return {
          date,
          dt: data.dt,
          temp_max: Math.round(Math.max(...data.temps)),
          temp_min: Math.round(Math.min(...data.temps)),
          icon: mainIcon,
          description: mainDesc,
        };
      });

    return NextResponse.json({
      location: name,
      daily,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
