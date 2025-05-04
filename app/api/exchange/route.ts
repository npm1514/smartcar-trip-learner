import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { store } from '../store';
import querystring from 'querystring';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from query params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('Exchanging code for token:', code.substring(0, 10) + '...');

    // Exchange code for token directly using Smartcar's API
    const clientId = process.env.SMARTCAR_CLIENT_ID || '';
    const clientSecret = process.env.SMARTCAR_CLIENT_SECRET || '';
    const redirectUri = process.env.SMARTCAR_REDIRECT_URI || '';

    console.log('Using client credentials:', { 
      clientId: clientId.substring(0, 8) + '...',
      clientSecretLength: clientSecret ? clientSecret.length : 0,
      redirectUri
    });

    // Prepare the request data
    const formData = querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    });

    // Create Basic Auth header manually
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const exchangeResponse = await axios.post(
      'https://auth.smartcar.com/oauth/token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        }
      }
    );

    // The Smartcar token response structure
    const tokenData = exchangeResponse.data;
    console.log('Token received successfully', {
      hasAccessToken: !!tokenData.access_token,
      accessTokenFirstChars: tokenData.access_token ? tokenData.access_token.substring(0, 10) + '...' : null,
      expiresIn: tokenData.expires_in,
      hasRefreshToken: !!tokenData.refresh_token
    });
    
    // Store the tokens
    store.setTokens(tokenData.access_token, tokenData.refresh_token);
    
    console.log('Token stored in memory:', {
      hasAccessToken: !!store.accessToken,
      accessTokenFirstChars: store.accessToken ? store.accessToken.substring(0, 10) + '...' : null,
    });

    console.log('Access token obtained, now fetching vehicles...');

    // Get vehicles
    if (store.accessToken) {
      try {
        const response = await axios.get('https://api.smartcar.com/v2.0/vehicles', {
          headers: { 'Authorization': `Bearer ${store.accessToken}` }
        });
        
        console.log('Vehicles API response:', response.data);
        
        if (response.data.vehicles && response.data.vehicles.length > 0) {
          store.setVehicleId(response.data.vehicles[0]);
          console.log('Selected vehicle ID:', store.vehicleId);
          
          const apiResponse = NextResponse.json({
            success: true,
            hasVehicles: true,
            vehicleCount: response.data.vehicles.length,
            debug: {
              hasToken: !!store.accessToken,
              hasVehicleId: !!store.vehicleId
            }
          });
          
          return apiResponse;
        } else {
          console.log('No vehicles found in response');
          return NextResponse.json({
            success: true,
            hasVehicles: false,
            vehicleCount: 0,
            message: 'No vehicles found in the user account'
          });
        }
      } catch (vehicleError: any) {
        console.error('Error fetching vehicles:', vehicleError.message);
        if (vehicleError.response) {
          console.error('Vehicle error details:', {
            status: vehicleError.response.status,
            data: vehicleError.response.data
          });
        }
        
        return NextResponse.json({
          success: false,
          error: 'Failed to get vehicles',
          message: vehicleError.message,
          details: vehicleError.response?.data
        }, { status: 500 });
      }
    } else {
      console.error('No access token available after exchange');
      return NextResponse.json({
        success: false,
        error: 'No access token obtained from token exchange'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Exchange error:', error.message);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    return NextResponse.json(
      { error: error.message, details: error.response?.data },
      { status: 500 }
    );
  }
} 