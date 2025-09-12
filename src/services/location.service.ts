import axios from 'axios';

export interface LocationDetails {
  latitude: number;
  longitude: number;
  locationName: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export class LocationService {
  // Free geocoding service using OpenStreetMap Nominatim
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  
  // Rate limiting: 1 request per second (free tier)
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 1000; // 1 second

  /**
   * Get location details from coordinates (reverse geocoding)
   */
  static async getLocationFromCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<LocationDetails | null> {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.NOMINATIM_BASE_URL}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1,
          zoom: 18, // High detail level
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'NeighBridge-App/1.0' // Required by Nominatim
        }
      });

      if (response.data && response.data.display_name) {
        const data = response.data;
        const address = data.address || {};
        
        return {
          latitude,
          longitude,
          locationName: this.extractLocationName(data),
          address: data.display_name,
          city: address.city || address.town || address.village || address.hamlet,
          state: address.state || address.province,
          country: address.country,
          postalCode: address.postcode
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting location from coordinates:', error);
      return null;
    }
  }

  /**
   * Get coordinates from address (forward geocoding)
   */
  static async getCoordinatesFromAddress(address: string): Promise<GeocodingResult | null> {
    try {
      await this.rateLimit();
      
      const response = await axios.get(`${this.NOMINATIM_BASE_URL}/search`, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'NeighBridge-App/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        const addressDetails = data.address || {};
        
        return {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
          address: data.display_name,
          city: addressDetails.city || addressDetails.town || addressDetails.village,
          state: addressDetails.state || addressDetails.province,
          country: addressDetails.country,
          postalCode: addressDetails.postcode
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }

  /**
   * Validate if coordinates are within reasonable bounds
   */
  static validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    );
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  /**
   * Check if a location is within a certain radius of another location
   */
  static isWithinRadius(
    centerLat: number,
    centerLng: number,
    checkLat: number,
    checkLng: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLng, checkLat, checkLng);
    return distance <= radiusKm;
  }

  /**
   * Extract a meaningful location name from Nominatim response
   */
  private static extractLocationName(data: any): string {
    const address = data.address || {};
    
    // Try to get the most specific location name
    const name = 
      address.name || 
      address.house_name ||
      address.amenity ||
      address.shop ||
      address.office ||
      address.building ||
      address.road ||
      address.neighbourhood ||
      address.suburb ||
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.state ||
      address.country;
    
    return name || 'Unknown Location';
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Rate limiting for free Nominatim API
   */
  private static async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get location details with fallback to basic info if geocoding fails
   */
  static async getLocationDetailsWithFallback(
    latitude: number,
    longitude: number,
    fallbackName?: string
  ): Promise<LocationDetails> {
    const locationDetails = await this.getLocationFromCoordinates(latitude, longitude);
    
    if (locationDetails) {
      return locationDetails;
    }
    
    // Fallback to basic location info
    return {
      latitude,
      longitude,
      locationName: fallbackName || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      address: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`,
      city: 'Unknown',
      country: 'Unknown'
    };
  }
}
