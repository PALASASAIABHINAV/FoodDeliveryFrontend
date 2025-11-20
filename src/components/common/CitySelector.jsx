import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Navigation } from "lucide-react";
import axios from "axios";
import { useUserStore } from "../../store/useAuthStore";

const CitySelector = () => {
  const {
    selectedCity,
    detectedLocation,
    setSelectedCity,
    resetToDetectedLocation,
    isManualSelection,
  } = useUserStore();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // 🔒 close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
        setCities([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌍 search cities (GeoDB)
  const searchCities = async (query) => {
    if (!query || query.length < 2) {
      setCities([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `https://${import.meta.env.VITE_GEODB_API_HOST}/v1/geo/cities`,
        {
          params: {
            namePrefix: query,
            limit: 10,
            offset: 0,
            types: "CITY",
            sort: "-population",
            languageCode: "en",
          },
          headers: {
            "X-RapidAPI-Key": import.meta.env.VITE_GEODB_API_KEY,
            "X-RapidAPI-Host": import.meta.env.VITE_GEODB_API_HOST,
          },
        }
      );

      if (response.data && response.data.data) {
        setCities(response.data.data);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error("Error searching cities:", err);
      setError("Unable to search right now. Please try again.");
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // ⏱ debounced input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchCities(query);
    }, 1000);
  };

  // ✅ select city
  const handleCitySelect = (city) => {
    const cityName = city.city || city.name;
    setSelectedCity(cityName);
    setIsOpen(false);
    setSearchQuery("");
    setCities([]);
  };

  // 🧭 use detected location
  const handleUseCurrentLocation = () => {
    resetToDetectedLocation();
    setIsOpen(false);
    setSearchQuery("");
    setCities([]);
  };

  // open dropdown + focus
  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const displayCity = selectedCity || "Choose city";
  const isDetectedCity =
    !isManualSelection && detectedLocation?.city === selectedCity;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger pill – matches ZentroEat navbar style */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-full bg-white/95 border border-emerald-100 px-4 py-2.5 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-200 min-w-[230px] group"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition">
          <MapPin className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
        </span>
        <div className="flex-1 text-left">
          <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
            Deliver to
          </p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {displayCity}
          </p>
        </div>
        {isDetectedCity && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-600">
            <Navigation className="w-3 h-3" />
            Live
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-[420px] max-w-[95vw] rounded-2xl border border-emerald-100 bg-white/95 shadow-2xl backdrop-blur-sm z-50 overflow-hidden">
          {/* Header search */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-cyan-50">
            <p className="text-[11px] font-semibold text-emerald-700 mb-2">
              Where should we deliver?
            </p>
            <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 shadow-inner">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for a city…"
                className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCities([]);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Current location chip */}
          {detectedLocation?.city && (
            <div className="border-b border-slate-100">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/60 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Use current location
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {detectedLocation.city}, {detectedLocation.state}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-500 font-medium">
                  Recommended
                </span>
              </button>
            </div>
          )}

          {/* Results list */}
          <div className="max-h-[320px] overflow-y-auto bg-white">
            {loading && (
              <div className="p-4 text-center text-slate-500">
                <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <p className="text-xs">Searching cities…</p>
              </div>
            )}

            {error && !loading && (
              <div className="p-4 text-center text-red-500 text-xs">
                {error}
              </div>
            )}

            {!loading && !error && cities.length === 0 && searchQuery.length >= 2 && (
              <div className="p-4 text-center text-slate-400 text-xs">
                No cities found. Try a different spelling.
              </div>
            )}

            {!loading && cities.length > 0 && (
              <div className="divide-y divide-slate-100">
                {cities.map((city) => (
                  <button
                    type="button"
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {city.city || city.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {city.region && `${city.region}, `}
                        {city.country}
                      </p>
                    </div>
                    {city.population && (
                      <p className="text-[10px] text-slate-400 font-medium">
                        {(city.population / 1000000).toFixed(1)}M
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!searchQuery && !loading && (
              <div className="p-4 text-center text-slate-400">
                <p className="text-xs">
                  Start typing to search popular cities like{" "}
                  <span className="font-semibold text-slate-500">
                    Mumbai, Delhi, Bangalore…
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
