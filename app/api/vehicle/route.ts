import { NextResponse } from 'next/server';
import axios from 'axios';
import { store } from '../store';

// Timeout utility for axios requests
const withTimeout = (promise: Promise<any>, timeoutMs: number) => {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).then(result => {
    clearTimeout(timeoutHandle);
    return result;
  }).catch(error => {
    clearTimeout(timeoutHandle);
    throw error;
  });
};

export async function GET() {
  console.log('Vehicle API called');
  
  try {
    console.log('Vehicle API called, current store state:', store.getStatus());
    
    if (!store.accessToken) {
      console.log('No access token available');
      return NextResponse.json(
        {
          error: 'No access token available. Please connect your vehicle first.',
          hasToken: !!store.accessToken
        },
        { status: 400 }
      );
    }
    
    if (!store.vehicleId) {
      console.log('No vehicle ID available');
      return NextResponse.json(
        {
          error: 'No vehicle ID available. Please connect your vehicle first.',
          hasVehicleId: !!store.vehicleId
        },
        { status: 400 }
      );
    }

    console.log('Fetching vehicle info for vehicle ID:', store.vehicleId);

    // Get vehicle info
    try {
      console.log('Making request to Smartcar for vehicle info');
      
      const vehicleInfo = await withTimeout(
        axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}`, {
          headers: { 'Authorization': `Bearer ${store.accessToken}` }
        }),
        10000 // 10 second timeout
      );

      console.log('Vehicle basic info received');

      // Create the response object
      const vehicleData = {
        id: store.vehicleId,
        ...vehicleInfo.data
      };

      // Try to get additional vehicle info (with error handling for each request)
      try {
        console.log('Fetching detailed vehicle info...');
        const infoResponse = await withTimeout(
          axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}/info`, {
            headers: { 'Authorization': `Bearer ${store.accessToken}` }
          }),
          10000
        );
        vehicleData.info = infoResponse.data;
        console.log('Vehicle info details received');
      } catch (infoError: any) {
        console.log('Could not get vehicle info details:', infoError.message);
        // Continue without this data
      }

      // Try to get location
      try {
        console.log('Fetching vehicle location...');
        const locationResponse = await withTimeout(
          axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}/location`, {
            headers: { 'Authorization': `Bearer ${store.accessToken}` }
          }),
          10000
        );
        vehicleData.location = locationResponse.data;
        console.log('Vehicle location received');
      } catch (locationError: any) {
        console.log('Could not get vehicle location:', locationError.message);
        // Continue without this data
      }

      // Try to get odometer
      try {
        console.log('Fetching vehicle odometer...');
        const odometerResponse = await withTimeout(
          axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}/odometer`, {
            headers: { 'Authorization': `Bearer ${store.accessToken}` }
          }),
          10000
        );
        vehicleData.odometer = odometerResponse.data;
        console.log('Vehicle odometer received');
      } catch (odometerError: any) {
        console.log('Could not get vehicle odometer:', odometerError.message);
        // Continue without this data
      }

      console.log('All available vehicle data collected, returning response');
      return NextResponse.json(vehicleData);
    } catch (vehicleError: any) {
      console.error('Error fetching basic vehicle info:', vehicleError.message);
      if (vehicleError.response) {
        console.error('Error response:', {
          status: vehicleError.response.status,
          data: vehicleError.response.data
        });
      } else if (vehicleError.code === 'ECONNABORTED' || vehicleError.message.includes('timeout')) {
        console.error('Request timed out');
      }
      
      return NextResponse.json(
        {
          error: 'Failed to get vehicle information',
          message: vehicleError.message,
          details: vehicleError.response?.data,
          timeout: vehicleError.message.includes('timeout')
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Vehicle data error:', error.message);
    return NextResponse.json({ 
      error: error.message,
      unhandled: true
    }, { status: 500 });
  }
} 