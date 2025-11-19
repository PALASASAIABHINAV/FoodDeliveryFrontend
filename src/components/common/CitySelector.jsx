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

  // Close dropdown when clicking outside
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

  // Search cities using GeoDB API
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
            sort: "-population", // Sort by population (largest first)
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
      setError("Failed to search cities. Please try again.");
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (1 second delay to respect rate limit)
    debounceTimer.current = setTimeout(() => {
      searchCities(query);
    }, 1000); // 1 second delay for rate limiting
  };

  // Select a city
  const handleCitySelect = (city) => {
    const cityName = city.city || city.name;
    setSelectedCity(cityName);
    setIsOpen(false);
    setSearchQuery("");
    setCities([]);
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    resetToDetectedLocation();
    setIsOpen(false);
    setSearchQuery("");
    setCities([]);
  };

  // Open dropdown and focus input
  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const displayCity = selectedCity || "Select City";
  const isDetectedCity = !isManualSelection && detectedLocation?.city === selectedCity;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* City Display Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-400 px-4 py-2.5 rounded-lg transition-all duration-200 min-w-[200px] group"
      >
        <MapPin className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
        <div className="flex-1 text-left">
          <p className="text-xs text-gray-500">Deliver to</p>
          <p className="font-semibold text-gray-800 truncate">{displayCity}</p>
        </div>
        {isDetectedCity && (
          <Navigation className="w-4 h-4 text-green-500" title="Current Location" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-[400px] bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for city..."
                className="flex-1 bg-transparent outline-none text-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCities([]);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Current Location Option */}
          {detectedLocation?.city && (
            <div className="border-b">
              <button
                onClick={handleUseCurrentLocation}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Use Current Location</p>
                  <p className="text-sm text-gray-500">
                    {detectedLocation.city}, {detectedLocation.state}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Search Results */}
          <div className="max-h-[300px] overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Searching cities...</p>
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-red-500">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && cities.length === 0 && searchQuery.length >= 2 && (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No cities found. Try different keywords.</p>
              </div>
            )}

            {!loading && cities.length > 0 && (
              <div>
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{city.city || city.name}</p>
                      <p className="text-sm text-gray-500">
                        {city.region && `${city.region}, `}
                        {city.country}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {city.population ? `${(city.population / 1000000).toFixed(1)}M` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Hint for better results */}
            {!searchQuery && (
              <div className="p-4 text-center text-gray-400">
                <p className="text-sm">Type city name to search</p>
                <p className="text-xs mt-1">Example: Mumbai, Delhi, Bangalore</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector;