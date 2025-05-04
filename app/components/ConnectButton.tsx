'use client';

import { useEffect } from 'react';
import Smartcar from '@smartcar/auth';

interface ConnectButtonProps {
  onAuthSuccess: (code: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export default function ConnectButton({ onAuthSuccess, setLoading, setError }: ConnectButtonProps) {
  useEffect(() => {
    // Initialize Smartcar with callback
    const onComplete = (err: Error | null, code: string) => {
      if (err) {
        console.error('Smartcar authorization error:', err);
        setError(`Authorization failed: ${err.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      // Authorization successful, pass the code to parent
      onAuthSuccess(code);
    };
    
    // Create Smartcar instance
    const smartcar = new Smartcar({
      clientId: process.env.NEXT_PUBLIC_SMARTCAR_CLIENT_ID,
      redirectUri: process.env.NEXT_PUBLIC_SMARTCAR_REDIRECT_URI,
      scope: ['required:read_vehicle_info', 'read_odometer', 'read_location'],
      mode: 'live',
      onComplete,
    });
    
    // Attach to window for global access (optional)
    (window as any).smartcar = smartcar;
    
  }, [onAuthSuccess, setLoading, setError]);
  
  // Handle connect button click
  const handleConnect = () => {
    setLoading(true);
    setError('');
    
    // Access the Smartcar instance and open auth dialog
    const smartcar = (window as any).smartcar;
    if (smartcar) {
      smartcar.openDialog({ forcePrompt: true });
    } else {
      setError('Smartcar SDK not initialized properly');
      setLoading(false);
    }
  };
  
  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="mb-8">
        <img 
          src="/car-icon.png" 
          alt="Car Icon" 
          className="mx-auto mb-4 w-24 h-24 opacity-80"
          onError={(e) => {
            // Fallback if image doesn't exist
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h2 className="text-2xl font-bold mb-2">Connect Your Vehicle</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Connect your vehicle to access information like location, odometer readings, and more.
        </p>
      </div>
      
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="mr-3 text-green-500">✓</div>
          <div className="text-sm text-left">Secure connection using OAuth</div>
        </div>
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="mr-3 text-green-500">✓</div>
          <div className="text-sm text-left">Works with major vehicle brands</div>
        </div>
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="mr-3 text-green-500">✓</div>
          <div className="text-sm text-left">No personal data is stored</div>
        </div>
      </div>
      
      <button 
        onClick={handleConnect}
        className="btn btn-primary w-full"
      >
        Connect Vehicle
      </button>
    </div>
  );
} 