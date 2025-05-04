import { NextResponse } from 'next/server';
import { store } from '../store';

export async function GET() {
  const status = store.getStatus();
  
  return NextResponse.json({
    status: 'running',
    hasToken: status.hasAccessToken,
    hasVehicleId: status.hasVehicleId,
    accessTokenFragment: status.accessTokenFragment,
    vehicleIdFragment: status.vehicleIdFragment,
    timestamp: new Date().toISOString(),
  });
} 