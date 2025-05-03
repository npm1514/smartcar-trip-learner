import React, { useState, useEffect } from 'react';
import Smartcar from '@smartcar/auth';
import axios from 'axios';
import './App.css';

// Components
import Connect from './components/Connect';
import Vehicle from './components/Vehicle';

function App() {
  const [vehicle, setVehicle] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState(null);

  // Backend URL
  const BACKEND_URL = 'http://localhost:3001';

  // Initialize Smartcar object
  const smartcar = new Smartcar({
    clientId: '486fc2cf-f358-48d9-b0e1-161193de8c8e',
    redirectUri: 'https://javascript-sdk.smartcar.com/v2/redirect?app_origin=http://localhost:3000',
    scope: ['required:read_vehicle_info', 'read_odometer', 'read_location'],
    mode: 'live',
    onComplete: onComplete,
  });

  // Check server status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Authorization handler
  function authorize() {
    setLoading(true);
    setError('');
    smartcar.openDialog({ forcePrompt: true });
  }

  // Check backend status
  async function checkBackendStatus() {
    try {
      const response = await axios.get(`${BACKEND_URL}/status`);
      setServerStatus(response.data);
      return response.data;
    } catch (error) {
      console.error('Backend server error:', error.message);
      setServerStatus({ status: 'error', error: error.message });
      return { status: 'error', error: error.message };
    }
  }

  // Handle the authorization response
  async function onComplete(err, code) {
    if (err) {
      console.error('Smartcar authorization error:', err);
      setError(`Authorization failed: ${err.message || 'Unknown error'}`);
      setLoading(false);
      return;
    }

    try {
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
      await axios.get(`${BACKEND_URL}/exchange?code=${code}`);
      
      // Get vehicle information
      console.log('Fetching vehicle information...');
      const response = await axios.get(`${BACKEND_URL}/vehicle`);
      console.log('Vehicle data received');
      
      setVehicle(response.data);
      setLoading(false);
    } catch (error) {
      console.error('API request error:', error);
      
      let errorMessage = 'Failed to get vehicle data. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Smartcar Vehicle Dashboard</h1>
        
        {/* Server status indicator */}
        {serverStatus && (
          <div className={`server-status ${serverStatus.status === 'running' ? 'online' : 'offline'}`}>
            Server: {serverStatus.status === 'running' ? 'Online' : 'Offline'}
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : Object.keys(vehicle).length !== 0 ? (
          <Vehicle info={vehicle} />
        ) : (
          <Connect onClick={authorize} />
        )}
      </header>
    </div>
  );
}

export default App;
