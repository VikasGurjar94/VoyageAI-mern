const axios = require("axios");
const NodeCache = require("node-cache");

// cache geocoding results for 24 hours
// prevents hitting Nominatim rate limits (1 req/sec max)
const geoCache = new NodeCache({ stdTTL: 86400 });

// Nominatim requires a real User-Agent header
// use your app name and email — they ask for this
const NOMINATIM_HEADERS = {
  "User-Agent": "VoyageTours/1.0 (your_email@gmail.com)",
  "Accept-Language": "en",
};

// ── GEOCODE ───────────────────────────────────────────────────
// converts a place name to lat/lng coordinates
// GET /api/maps/geocode?location=Aguada Fort, Goa
const geocode = async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location) {
      res.status(400);
      throw new Error("Location query parameter is required");
    }

    // check cache first
    const cacheKey = `geo:${location.toLowerCase().trim()}`;
    const cached = geoCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, ...cached, cached: true });
    }

    // call Nominatim — free OpenStreetMap geocoding
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: location,
          format: "json",
          limit: 1,
          addressdetails: 1,
        },
        headers: NOMINATIM_HEADERS,
        timeout: 8000,
      },
    );

    if (!response.data || response.data.length === 0) {
      return res.status(200).json({
        success: true,
        found: false,
        message: `Location "${location}" not found`,
      });
    }

    const place = response.data[0];
    const result = {
      found: true,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      displayName: place.display_name,
      type: place.type,
    };

    // save to cache
    geoCache.set(cacheKey, result);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// ── GEOCODE MULTIPLE ──────────────────────────────────────────
// geocodes an array of locations in one call
// POST /api/maps/geocode-many
// body: { locations: ["Aguada Fort, Goa", "Calangute Beach"] }
const geocodeMany = async (req, res, next) => {
  try {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations)) {
      res.status(400);
      throw new Error("locations array is required");
    }

    // geocode each location — with 1 second delay between calls
    // Nominatim's usage policy: max 1 request per second
    const results = [];

    for (const location of locations) {
      if (!location || location.trim() === "") {
        results.push({ location, found: false });
        continue;
      }

      const cacheKey = `geo:${location.toLowerCase().trim()}`;
      const cached = geoCache.get(cacheKey);

      if (cached) {
        results.push({ location, ...cached });
        continue;
      }

      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: location,
              format: "json",
              limit: 1,
            },
            headers: NOMINATIM_HEADERS,
            timeout: 8000,
          },
        );

        if (response.data && response.data.length > 0) {
          const place = response.data[0];
          const geo = {
            found: true,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            displayName: place.display_name,
          };
          geoCache.set(cacheKey, geo);
          results.push({ location, ...geo });
        } else {
          results.push({ location, found: false });
        }
      } catch {
        results.push({ location, found: false });
      }

      // respect Nominatim rate limit — 1 request per second
      await new Promise((r) => setTimeout(r, 1100));
    }

    res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

// ── NEARBY PLACES ─────────────────────────────────────────────
// finds real places near a lat/lng using Overpass API (free)
// GET /api/maps/nearby?lat=15.4&lng=73.8&type=restaurant&radius=1000
const nearby = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      type = "restaurant",
      radius = 1000, // meters
    } = req.query;

    if (!lat || !lng) {
      res.status(400);
      throw new Error("lat and lng are required");
    }

    const cacheKey = `nearby:${lat}:${lng}:${type}:${radius}`;
    const cached = geoCache.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, places: cached, cached: true });
    }

    // build Overpass QL query based on place type
    const overpassQuery = buildOverpassQuery(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius),
      type,
    );

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      overpassQuery,
      {
        headers: { "Content-Type": "text/plain" },
        timeout: 15000,
      },
    );

    // parse and clean Overpass response
    const places = (response.data.elements || [])
      .filter((el) => el.tags && el.tags.name) // only named places
      .slice(0, 15) // limit to 15 nearby places
      .map((el) => ({
        id: el.id,
        name: el.tags.name,
        type,
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        address: buildAddress(el.tags),
        phone: el.tags.phone || el.tags["contact:phone"] || null,
        website: el.tags.website || el.tags["contact:website"] || null,
        opening: el.tags.opening_hours || null,
        cuisine: el.tags.cuisine || null,
        rating: el.tags["stars"] || null,
      }))
      .filter((p) => p.lat && p.lng);

    geoCache.set(cacheKey, places, 3600); // cache for 1 hour

    res.status(200).json({ success: true, places });
  } catch (error) {
    next(error);
  }
};

// ── Helper: build Overpass QL query ───────────────────────────
const buildOverpassQuery = (lat, lng, radius, type) => {
  const typeMap = {
    restaurant: "[amenity=restaurant]",
    cafe: "[amenity=cafe]",
    hotel: "[tourism=hotel]",
    atm: "[amenity=atm]",
    hospital: "[amenity=hospital]",
    pharmacy: "[amenity=pharmacy]",
    attraction: '[tourism~"attraction|museum|viewpoint|monument"]',
    shopping: '[shop~"mall|supermarket|market"]',
    transport: '[amenity~"bus_station|taxi|car_rental"]',
  };

  const filter = typeMap[type] || "[amenity=restaurant]";

  return `
    [out:json][timeout:15];
    (
      node${filter}(around:${radius},${lat},${lng});
      way${filter}(around:${radius},${lat},${lng});
    );
    out center;
  `;
};

// ── Helper: build readable address from tags ──────────────────
const buildAddress = (tags) => {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
};

module.exports = { geocode, geocodeMany, nearby };
