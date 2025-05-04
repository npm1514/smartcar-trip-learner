import { NextResponse } from 'next/server';
import { store } from '../store';

export async function GET() {
  return NextResponse.json({
    hasAccessToken: !!store.accessToken,
    accessTokenFragment: store.accessToken ? store.accessToken.substring(0, 10) + '...' : null,
    hasRefreshToken: !!store.refreshToken,
    hasVehicleId: !!store.vehicleId,
    vehicleIdFragment: store.vehicleId ? store.vehicleId.substring(0, 10) + '...' : null
  });
} 