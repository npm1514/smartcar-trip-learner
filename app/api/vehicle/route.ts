import { NextResponse } from 'next/server';
import axios from 'axios';
import { store } from '../store';

export async function GET() {
  try {
    console.log('Vehicle API called, current store state:', store.getStatus());
    
    if (!store.accessToken) {
      return NextResponse.json(
        {
          error: 'No access token available. Please connect your vehicle first.',
          hasToken: !!store.accessToken
        },
        { status: 400 }
      );
    }
    
    if (!store.vehicleId) {
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
      const vehicleInfo = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}`, {
        headers: { 'Authorization': `Bearer ${store.accessToken}` }
      });

      console.log('Vehicle basic info received');

      // Create the response object
      const vehicleData = {
        id: store.vehicleId,
        ...vehicleInfo.data
      };

      // Try to get additional vehicle info
      try {
        console.log('Fetching detailed vehicle info...');
        const infoResponse = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}/info`, {
          headers: { 'Authorization': `Bearer ${store.accessToken}` }
        });
        vehicleData.info = infoResponse.data;
      } catch (infoError: any) {
        console.log('Could not get vehicle info details:', infoError.message);
      }

      // Try to get location
      try {
        console.log('Fetching vehicle location...');
        const locationResponse = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}/location`, {
          headers: { 'Authorization': `Bearer ${store.accessToken}` }
        });
        vehicleData.location = locationResponse.data;
      } catch (locationError: any) {
        console.log('Could not get vehicle location:', locationError.message);
      }

      // Try to get odometer
      try {
        console.log('Fetching vehicle odometer...');
        const odometerResponse = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${store.vehicleId}/odometer`, {
          headers: { 'Authorization': `Bearer ${store.accessToken}` }
        });
        vehicleData.odometer = odometerResponse.data;
      } catch (odometerError: any) {
        console.log('Could not get vehicle odometer:', odometerError.message);
      }

      return NextResponse.json(vehicleData);
    } catch (vehicleError: any) {
      console.error('Error fetching basic vehicle info:', vehicleError.message);
      if (vehicleError.response) {
        console.error('Error response:', {
          status: vehicleError.response.status,
          data: vehicleError.response.data
        });
      }
      
      return NextResponse.json(
        {
          error: 'Failed to get vehicle information',
          message: vehicleError.message,
          details: vehicleError.response?.data
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Vehicle data error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 