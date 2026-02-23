"use client";

import { useState, FormEvent } from "react";

interface DayForecast {
  date: string;
  dt: number;
  temp_max: number;
  temp_min: number;
  icon: string;
  description: string;
}

interface WeatherData {
  location: string;
  daily: DayForecast[];
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getFormattedDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getWeatherGradient(icon: string): string {
  if (icon.includes("01")) return "from-amber-400 to-orange-500";
  if (icon.includes("02")) return "from-blue-300 to-amber-300";
  if (icon.includes("03") || icon.includes("04"))
    return "from-slate-400 to-slate-500";
  if (icon.includes("09") || icon.includes("10"))
    return "from-blue-500 to-indigo-600";
  if (icon.includes("11")) return "from-purple-600 to-slate-700";
  if (icon.includes("13")) return "from-blue-100 to-slate-300";
  if (icon.includes("50")) return "from-slate-300 to-slate-400";
  return "from-sky-400 to-blue-500";
}

export default function Home() {
  const [zip, setZip] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!zip.match(/^\d{5}$/)) {
      setError("Please enter a valid 5-digit US zip code");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const res = await fetch(`/api/weather?zip=${zip}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setWeather(data);
    } catch {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-500 ${darkMode ? "from-slate-900 via-blue-950 to-indigo-950 text-white" : "from-sky-100 via-blue-50 to-indigo-100 text-slate-900"}`}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${darkMode ? "bg-blue-500/10" : "bg-blue-400/20"}`} />
        <div className={`absolute top-1/3 -left-20 w-72 h-72 rounded-full blur-3xl ${darkMode ? "bg-indigo-500/10" : "bg-indigo-300/20"}`} />
        <div className={`absolute bottom-20 right-1/4 w-80 h-80 rounded-full blur-3xl ${darkMode ? "bg-purple-500/8" : "bg-purple-300/15"}`} />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-12 sm:py-20">
        {/* Theme toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 cursor-pointer ${darkMode ? "bg-white/10 border-white/15 hover:bg-white/20 text-yellow-300" : "bg-white/60 border-slate-200 hover:bg-white/80 text-slate-700"}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 mb-4 px-4 py-1.5 backdrop-blur-sm border rounded-full text-sm ${darkMode ? "bg-white/5 border-white/10 text-blue-200" : "bg-white/60 border-slate-200 text-blue-700"}`}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            Weather Forecast
          </div>
          <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r bg-clip-text text-transparent ${darkMode ? "from-white to-blue-200" : "from-slate-900 to-blue-700"}`}>
            7-Day Forecast
          </h1>
          <p className={`text-lg ${darkMode ? "text-blue-200/70" : "text-slate-500"}`}>
            Enter your zip code to see what&apos;s ahead
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter zip code"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                className={`w-full px-5 py-3.5 backdrop-blur-md border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all text-lg ${darkMode ? "bg-white/10 border-white/15 text-white placeholder-blue-200/40" : "bg-white/70 border-slate-300 text-slate-900 placeholder-slate-400"}`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-7 py-3.5 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 text-lg cursor-pointer ${darkMode ? "bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 hover:shadow-blue-500/25 text-white" : "bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400/50 hover:shadow-blue-600/25 text-white"}`}
            >
              {loading ? (
                <svg
                  className="w-6 h-6 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className={`max-w-md mx-auto mb-8 px-5 py-4 border rounded-2xl text-center backdrop-blur-sm ${darkMode ? "bg-red-500/10 border-red-400/20 text-red-200" : "bg-red-50 border-red-200 text-red-700"}`}>
            {error}
          </div>
        )}

        {/* Weather Results */}
        {weather && (
          <div>
            {/* Location header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <svg
                  className={`w-5 h-5 ${darkMode ? "text-blue-300" : "text-blue-600"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {weather.location}
              </h2>
            </div>

            {/* Today highlight card */}
            {weather.daily.length > 0 && (
              <div
                className={`mb-6 p-8 rounded-3xl bg-gradient-to-br ${getWeatherGradient(weather.daily[0].icon)} shadow-2xl text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 font-medium mb-1">
                      {getDayName(weather.daily[0].date)} &middot;{" "}
                      {getFormattedDate(weather.daily[0].date)}
                    </p>
                    <p className="text-6xl font-bold tracking-tight mb-2">
                      {weather.daily[0].temp_max}&deg;
                    </p>
                    <p className="text-white/70 text-lg">
                      Low: {weather.daily[0].temp_min}&deg;
                    </p>
                    <p className="text-white/90 capitalize mt-2 text-lg">
                      {weather.daily[0].description}
                    </p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.daily[0].icon}@4x.png`}
                    alt={weather.daily[0].description}
                    className="w-36 h-36 drop-shadow-lg"
                  />
                </div>
              </div>
            )}

            {/* Remaining days grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {weather.daily.slice(1).map((day) => (
                <div
                  key={day.date}
                  className={`group p-5 backdrop-blur-sm border rounded-2xl transition-all duration-300 ${darkMode ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20" : "bg-white/60 border-slate-200 hover:bg-white/80 hover:border-slate-300 shadow-sm"}`}
                >
                  <p className={`text-sm font-medium mb-1 ${darkMode ? "text-blue-200/70" : "text-slate-500"}`}>
                    {getDayName(day.date)}
                  </p>
                  <p className={`text-xs mb-3 ${darkMode ? "text-blue-200/40" : "text-slate-400"}`}>
                    {getFormattedDate(day.date)}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                    alt={day.description}
                    className="w-14 h-14 mx-auto mb-2 group-hover:scale-110 transition-transform"
                  />
                  <div className="text-center">
                    <span className="text-xl font-bold">{day.temp_max}&deg;</span>
                    <span className={`ml-2 ${darkMode ? "text-blue-200/50" : "text-slate-400"}`}>
                      {day.temp_min}&deg;
                    </span>
                  </div>
                  <p className={`text-xs capitalize text-center mt-2 ${darkMode ? "text-blue-200/50" : "text-slate-500"}`}>
                    {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
