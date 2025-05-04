'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ConnectButton from './components/ConnectButton';
import VehicleInfo from './components/VehicleInfo';

export default function Home() {
  const [vehicle, setVehicle] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<any>(null);

  // Check server status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Check backend status
  async function checkBackendStatus() {
    try {
      const response = await axios.get('/api/status');
      setServerStatus(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Backend server error:', error.message);
      setServerStatus({ status: 'error', error: error.message });
      return { status: 'error', error: error.message };
    }
  }

  // Handle successful authorization from Smartcar
  async function handleAuthSuccess(code: string) {
    try {
      setLoading(true);
      setError('');
      
      console.log('Authorization code received');
      
      // Check backend status
      const status = await checkBackendStatus();
      if (status.status !== 'running') {
        setError('Backend server is not running');
        setLoading(false);
        return;
      }

      // Exchange authorization code for access token
      console.log('Exchanging code for token...');
      const exchangeResponse = await axios.get(`/api/exchange?code=${code}`);
      console.log('Exchange response:', exchangeResponse.data);
      
      if (!exchangeResponse.data.success) {
        setError(exchangeResponse.data.error || 'Failed to exchange code for token');
        setLoading(false);
        return;
      }

      // Add a small delay to ensure token processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get vehicle information
      console.log('Fetching vehicle information...');
      try {
        const response = await axios.get('/api/vehicle');
        console.log('Vehicle data received:', response.data);
        
        setVehicle(response.data);
        setLoading(false);
      } catch (vehicleError: any) {
        console.error('Error fetching vehicle:', vehicleError);
        
        // Try again after a delay
        setTimeout(async () => {
          try {
            console.log('Retrying vehicle fetch...');
            const response = await axios.get('/api/vehicle');
            console.log('Vehicle data received on retry:', response.data);
            
            setVehicle(response.data);
            setLoading(false);
          } catch (retryError: any) {
            console.error('Retry failed:', retryError);
            const errorMsg = retryError.response?.data?.error || 'Failed to get vehicle data';
            setError(errorMsg);
            setLoading(false);
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error('API request error:', error);
      
      let errorMessage = 'Failed to get vehicle data. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  }

  // Process code from URL if present (for OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleAuthSuccess(code);
      
      // Remove the code from the URL to prevent duplicate requests
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Smartcar Vehicle Dashboard</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Connect and manage your vehicle with real-time data
          </p>
          
          {/* Server status indicator */}
          {serverStatus && (
            <div className="mb-6">
              <div className={`server-status ${serverStatus.status === 'running' ? 'online' : 'offline'}`}>
                Server: {serverStatus.status === 'running' ? 'Online' : 'Offline'}
              </div>
            </div>
          )}
          
          {error && (
            <div className="max-w-md mx-auto p-4 mb-8 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              <p>{error}</p>
            </div>
          )}
        </header>
        
        <main>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-lg">Connecting to your vehicle...</p>
            </div>
          ) : Object.keys(vehicle).length !== 0 ? (
            <VehicleInfo vehicleData={vehicle} />
          ) : (
            <ConnectButton 
              onAuthSuccess={handleAuthSuccess} 
              setLoading={setLoading}
              setError={setError}
            />
          )}
        </main>
      </div>
    </div>
  );
}
