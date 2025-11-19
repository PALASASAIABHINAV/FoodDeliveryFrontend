import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  
  // Location states
  detectedLocation: null, // User's actual GPS location
  selectedCity: null, // City user manually selected
  isManualSelection: false, // Flag to track if user manually changed city

  // Fetch current user
  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      set({ user: res.data, loading: false, error: null });
    } catch (err) {
      set({ user: null, loading: false, error: err.message });
      console.error("Error fetching current user:", err);
    }
  },

  // Login user and store data
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );
      set({ user: res.data.user, loading: false, error: null });
      return res.data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  // Logout
  logout: async () => {
    try {
      await axios.post(
        `${serverUrl}/api/auth/signout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    }
    set({ 
      user: null, 
      selectedCity: null, 
      isManualSelection: false 
    });
    localStorage.removeItem("selectedCity"); // Clear saved city
  },


  

  // Fetch user's GPS location
  fetchUserLocation: () => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported by browser.");
      // Load from localStorage if geolocation not supported
      const saved = localStorage.getItem("selectedCity");
      if (saved) {
        set({
          selectedCity: JSON.parse(saved),
          isManualSelection: true,
        });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        await get().updateUserLocation(latitude, longitude);


        try {
          const { data } = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${
              import.meta.env.VITE_GEOAPIFY_API_KEY
            }`
          );

          const result = data.results?.[0];
          if (!result) throw new Error("Invalid geocoding response");

          const detectedLoc = {
            city: result.city || null,
            state: result.state || null,
            country: result.country || null,
            address: result.formatted || null,
            latitude : latitude, 
            longitude: longitude,
          };

          set({ detectedLocation: detectedLoc });

          // If no manual selection, use detected location
          const { isManualSelection, selectedCity } = get();
          if (!isManualSelection && !selectedCity) {
            set({ selectedCity: detectedLoc.city });
          } else if (!selectedCity) {
            // Check localStorage for saved city
            const saved = localStorage.getItem("selectedCity");
            if (saved) {
              set({ selectedCity: JSON.parse(saved) });
            } else {
              set({ selectedCity: detectedLoc.city });
            }
          }
        } catch (error) {
          console.error("❌ Error fetching reverse geocode:", error);
          // Try loading from localStorage on error
          const saved = localStorage.getItem("selectedCity");
          if (saved) {
            set({
              selectedCity: JSON.parse(saved),
              isManualSelection: true,
            });
          }
        }
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        
        // Load from localStorage if geolocation fails
        const saved = localStorage.getItem("selectedCity");
        if (saved) {
          set({
            selectedCity: JSON.parse(saved),
            isManualSelection: true,
          });
        } else {
          // Set a default city if everything fails
          set({
            selectedCity: "Delhi",
            isManualSelection: false,
          });
        }

        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied location permission.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Position unavailable.");
            break;
          case error.TIMEOUT:
            console.error("Location request timed out.");
            break;
          default:
            console.error("Unknown geolocation error.");
        }
      }
    );
  },

  // Manually set selected city
  setSelectedCity: (cityName) => {
    set({ 
      selectedCity: cityName, 
      isManualSelection: true 
    });
    // Persist to localStorage
    localStorage.setItem("selectedCity", JSON.stringify(cityName));
  },

  // Reset to detected location
  resetToDetectedLocation: () => {
    const { detectedLocation } = get();
    if (detectedLocation?.city) {
      set({ 
        selectedCity: detectedLocation.city, 
        isManualSelection: false 
      });
      localStorage.removeItem("selectedCity");
    }
  },

  // Get current city (selected or detected)
  getCurrentCity: () => {
    const { selectedCity, detectedLocation } = get();
    return selectedCity || detectedLocation?.city || null;
  },

  initializeLocation: () => {
    const saved = localStorage.getItem("selectedCity");
    if (saved) {
      set({
        selectedCity: JSON.parse(saved),
        isManualSelection: true,
      });
      return; // Respect user's saved city, don't trigger GPS
    }

    // If nothing saved, try using detected location
    const { detectedLocation } = get();
    if (detectedLocation?.city) {
      set({
        selectedCity: detectedLocation.city,
        isManualSelection: false,
      });
      return;
    }

    // Otherwise fall back to GPS detection
    get().fetchUserLocation();
  },

  updateUserLocation: async (lat, lon) => {
    try {
      await axios.post(
        `${serverUrl}/api/user/update-location`,
        { lat, lon },
        { withCredentials: true }
      );
      console.log("📍 User location updated in DB");
    } catch (err) {
      console.error("❌ Failed to update user location:", err);
    }
  },

  toggleOnline: async () => {
  const res = await axios.post(`${serverUrl}/api/user/toggle-online`, {}, { withCredentials: true });
  set({ user: { ...get().user, isOnline: res.data.isOnline } });
  return res.data;
}


}));