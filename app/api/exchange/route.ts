import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { store } from '../store';
import querystring from 'querystring';

export async function GET(request: NextRequest) {
  console.log('Exchange endpoint called');
  
  try {
    // Get the authorization code from query params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      console.log('No code provided in request');
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('Exchanging code for token:', code.substring(0, 10) + '...');

    // Log environment variables (masked)
    const clientId = process.env.SMARTCAR_CLIENT_ID || '';
    const clientSecret = process.env.SMARTCAR_CLIENT_SECRET || '';
    const redirectUri = process.env.SMARTCAR_REDIRECT_URI || '';
    
    console.log('Environment check:', {
      hasClientId: !!clientId,
      clientIdPrefix: clientId ? clientId.substring(0, 5) + '...' : 'MISSING',
      hasClientSecret: !!clientSecret,
      clientSecretLength: clientSecret ? clientSecret.length : 0,
      redirectUri: redirectUri || 'MISSING'
    });

    // If we don't have the required environment variables, return error
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing required environment variables');
      return NextResponse.json({
        error: 'Server configuration error: Missing environment variables',
        missingVars: {
          clientId: !clientId,
          clientSecret: !clientSecret,
          redirectUri: !redirectUri
        }
      }, { status: 500 });
    }

    // Exchange the code for token (with more detailed error handling)
    try {
      // Prepare the request data
      const formData = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      });

      // Create Basic Auth header manually
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      console.log('Making token exchange request to Smartcar');
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
      try {
        store.setTokens(tokenData.access_token, tokenData.refresh_token);
        console.log('Tokens stored successfully');
      } catch (storeError) {
        console.error('Error storing tokens:', storeError);
        // Continue anyway, might still work
      }
      
      console.log('Token stored in memory:', {
        hasAccessToken: !!store.accessToken,
        accessTokenFirstChars: store.accessToken ? store.accessToken.substring(0, 10) + '...' : null,
      });

      console.log('Access token obtained, now fetching vehicles...');

      // Get vehicles
      if (store.accessToken) {
        try {
          console.log('Making request to Smartcar vehicles API');
          const response = await axios.get('https://api.smartcar.com/v2.0/vehicles', {
            headers: { 'Authorization': `Bearer ${store.accessToken}` }
          });
          
          console.log('Vehicles API response received');
          
          if (response.data.vehicles && response.data.vehicles.length > 0) {
            console.log(`Found ${response.data.vehicles.length} vehicles`);
            try {
              store.setVehicleId(response.data.vehicles[0]);
              console.log('Selected vehicle ID:', store.vehicleId);
            } catch (storeVehicleError) {
              console.error('Error storing vehicle ID:', storeVehicleError);
              // Continue anyway
            }
            
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
          } else {
            console.error('No response from vehicle API');
          }
          
          return NextResponse.json({
            success: false,
            error: 'Failed to get vehicles',
            message: vehicleError.message,
            details: vehicleError.response?.data || 'No response data'
          }, { status: 500 });
        }
      } else {
        console.error('No access token available after exchange');
        return NextResponse.json({
          success: false,
          error: 'No access token obtained from token exchange'
        }, { status: 500 });
      }
    } catch (exchangeError: any) {
      console.error('Token exchange error:', exchangeError.message);
      let errorDetails = 'Unknown error';
      
      if (exchangeError.response) {
        console.error('Exchange error response:', {
          status: exchangeError.response.status,
          data: JSON.stringify(exchangeError.response.data)
        });
        errorDetails = exchangeError.response.data;
      } else if (exchangeError.request) {
        console.error('No response received from token endpoint');
        errorDetails = 'No response from token server';
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to exchange authorization code for token',
        message: exchangeError.message,
        details: errorDetails
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unhandled exchange error:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Unhandled server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 