require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AuthClient } = require('smartcar');
const axios = require('axios');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

console.log('Loading Smartcar client with:', {
  clientId: process.env.SMARTCAR_CLIENT_ID ? process.env.SMARTCAR_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET',
  redirectUri: process.env.SMARTCAR_REDIRECT_URI || 'NOT SET',
  mode: 'test'
});

// Set up Smartcar client
const client = new AuthClient({
  clientId: process.env.SMARTCAR_CLIENT_ID,
  clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
  redirectUri: process.env.SMARTCAR_REDIRECT_URI,
  mode: 'live'
});

// Server state
let accessToken = null;
let refreshToken = null;
let vehicleId = null;

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    hasToken: !!accessToken,
    hasVehicleId: !!vehicleId,
    vehicleIdFragment: vehicleId ? vehicleId.substring(0, 10) + '...' : null
  });
});

// Exchange endpoint
app.get('/exchange', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Exchanging code for token:', code.substring(0, 10) + '...');
    
    const exchangeResponse = await client.exchangeCode(code);
    console.log('Token exchange successful:', {
      hasAccessToken: !!exchangeResponse.accessToken,
      hasRefreshToken: !!exchangeResponse.refreshToken,
      expiresAt: exchangeResponse.expiration
    });
    
    accessToken = exchangeResponse.accessToken;
    refreshToken = exchangeResponse.refreshToken;
    
    console.log('Access token obtained, now fetching vehicles...');

    // Get vehicles
    const response = await axios.get('https://api.smartcar.com/v2.0/vehicles', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log('Vehicles API response:', response.data);
    
    if (response.data.vehicles && response.data.vehicles.length > 0) {
      vehicleId = response.data.vehicles[0];
      console.log('Selected vehicle ID:', vehicleId);
    } else {
      console.log('No vehicles found in response. Full response:', JSON.stringify(response.data));
    }

    res.json({ 
      success: true,
      hasVehicles: response.data.vehicles && response.data.vehicles.length > 0,
      vehicleCount: response.data.vehicles ? response.data.vehicles.length : 0
    });
  } catch (error) {
    console.error('Exchange error:', error.message);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

// Vehicle endpoint
app.get('/vehicle', async (req, res) => {
  try {
    if (!accessToken) {
      return res.status(400).json({ 
        error: 'No access token available. Please connect your vehicle first.',
        hasToken: !!accessToken
      });
    }
    
    if (!vehicleId) {
      return res.status(400).json({ 
        error: 'No vehicle ID available. Please connect your vehicle first.',
        hasVehicleId: !!vehicleId
      });
    }

    console.log('Fetching vehicle info for vehicle ID:', vehicleId);

    // Get vehicle info
    try {
      const vehicleInfo = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      console.log('Vehicle basic info:', vehicleInfo.data);

      // Create the response object
      const vehicleData = {
        id: vehicleId,
        ...vehicleInfo.data
      };

      // Try to get additional vehicle info
      try {
        console.log('Fetching detailed vehicle info...');
        const infoResponse = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${vehicleId}/info`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('Detailed vehicle info:', infoResponse.data);
        vehicleData.info = infoResponse.data;
      } catch (infoError) {
        console.log('Could not get vehicle info details:', infoError.message);
        if (infoError.response) {
          console.log('Info error details:', {
            status: infoError.response.status,
            data: infoError.response.data
          });
        }
      }

      // Try to get location
      try {
        console.log('Fetching vehicle location...');
        const locationResponse = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${vehicleId}/location`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('Vehicle location:', locationResponse.data);
        vehicleData.location = locationResponse.data;
      } catch (locationError) {
        console.log('Could not get vehicle location:', locationError.message);
      }

      // Try to get odometer
      try {
        console.log('Fetching vehicle odometer...');
        const odometerResponse = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${vehicleId}/odometer`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('Vehicle odometer:', odometerResponse.data);
        vehicleData.odometer = odometerResponse.data;
      } catch (odometerError) {
        console.log('Could not get vehicle odometer:', odometerError.message);
      }

      console.log('Returning vehicle data with properties:', Object.keys(vehicleData));
      res.json(vehicleData);
    } catch (vehicleError) {
      console.error('Error fetching basic vehicle info:', vehicleError.message);
      if (vehicleError.response) {
        console.error('Error response:', {
          status: vehicleError.response.status,
          data: vehicleError.response.data
        });
      }
      res.status(500).json({ 
        error: 'Failed to get vehicle information', 
        message: vehicleError.message,
        details: vehicleError.response?.data
      });
    }
  } catch (error) {
    console.error('Vehicle data error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check current state
app.get('/debug', (req, res) => {
  res.json({
    hasAccessToken: !!accessToken,
    accessTokenFragment: accessToken ? accessToken.substring(0, 10) + '...' : null,
    hasRefreshToken: !!refreshToken,
    hasVehicleId: !!vehicleId,
    vehicleId: vehicleId
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Smartcar API is running',
    status: 'online',
    env: process.env.NODE_ENV || 'development'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`----------------------------------------`);
    console.log(`Smartcar server running on port ${PORT}`);
    console.log(`Using client ID: ${process.env.SMARTCAR_CLIENT_ID?.substring(0, 10)}...`);
    console.log(`Using redirect URI: ${process.env.SMARTCAR_REDIRECT_URI}`);
    console.log(`----------------------------------------`);
  });
}

// Export for serverless
module.exports = app; 