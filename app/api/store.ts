import { cookies } from 'next/headers';

// Server-side store that uses cookies for persistence between API calls
export const store = {
  // Instead of storing tokens in memory, we'll use getters and setters with cookies
  get accessToken() {
    // For server components
    try {
      return cookies().get('smartcar_access_token')?.value || null;
    } catch (e) {
      // Fallback for when cookies() is not available
      return null;
    }
  },
  
  get refreshToken() {
    try {
      return cookies().get('smartcar_refresh_token')?.value || null;
    } catch (e) {
      return null;
    }
  },
  
  get vehicleId() {
    try {
      return cookies().get('smartcar_vehicle_id')?.value || null;
    } catch (e) {
      return null;
    }
  },
  
  setTokens(access: string, refresh: string) {
    console.log(`Setting tokens: access=${access.substring(0, 10)}..., refresh=${refresh.substring(0, 5)}...`);
    
    // Set cookies with appropriate options
    try {
      cookies().set('smartcar_access_token', access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7200, // 2 hours, typical OAuth token lifespan
        path: '/'
      });
      
      cookies().set('smartcar_refresh_token', refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
        path: '/'
      });
    } catch (e) {
      console.error('Error setting token cookies:', e);
    }
    
    return this;
  },
  
  setVehicleId(id: string) {
    console.log(`Setting vehicle ID: ${id.substring(0, 10)}...`);
    
    try {
      cookies().set('smartcar_vehicle_id', id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7200, // Same as access token
        path: '/'
      });
    } catch (e) {
      console.error('Error setting vehicle ID cookie:', e);
    }
    
    return this;
  },
  
  getStatus() {
    const accessToken = this.accessToken;
    const refreshToken = this.refreshToken;
    const vehicleId = this.vehicleId;
    
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasVehicleId: !!vehicleId,
      accessTokenFragment: accessToken ? `${accessToken.substring(0, 10)}...` : null,
      vehicleIdFragment: vehicleId ? `${vehicleId.substring(0, 10)}...` : null,
    };
  },
  
  clear() {
    try {
      cookies().delete('smartcar_access_token');
      cookies().delete('smartcar_refresh_token');
      cookies().delete('smartcar_vehicle_id');
    } catch (e) {
      console.error('Error clearing cookies:', e);
    }
    
    return this;
  }
}; 