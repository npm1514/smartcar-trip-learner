import React from 'react';
import './Vehicle.css';

function Vehicle({ info }) {
  console.log("Vehicle component received data:", info);
  
  // Format number with commas (e.g., 123,456)
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    // Round to nearest integer first, then format with commas
    return new Intl.NumberFormat().format(Math.round(Number(value)));
  };

  return (
    <div className="vehicle-container">
      <h2>Your Vehicle Information</h2>
      
      <div className="vehicle-card">
        <div className="vehicle-header">
          <h3>
            {info ? 
              `${info.make || 'Unknown'} ${info.model || 'Vehicle'} (${info.year || 'N/A'})` 
              : 'Vehicle Details'}
          </h3>
          <p>VIN: {info.vin || 'N/A'}</p>
          <p>ID: {info.id || 'N/A'}</p>
        </div>
        
        <div className="vehicle-data">
          {/* Vehicle Info Section */}
          <div className="data-item">
            <h4>Vehicle Details</h4>
            {info ? (
              <>
                <p>Make: {info.make || 'N/A'}</p>
                <p>Model: {info.model || 'N/A'}</p>
                <p>Year: {info.year || 'N/A'}</p>
              </>
            ) : (
              <p>Detailed vehicle information not available</p>
            )}
          </div>
          
          {/* Odometer Section */}
          <div className="data-item">
            <h4>Odometer</h4>
            {info.odometer ? (
              <p>{formatNumber(info.odometer.distance)} {info.odometer.unit || 'miles'}</p>
            ) : (
              <p>Odometer information not available</p>
            )}
          </div>
          
          {/* Location Section */}
          <div className="data-item">
            <h4>Current Location</h4>
            {info.location ? (
              <>
                <p>Latitude: {info.location.latitude || '0'}</p>
                <p>Longitude: {info.location.longitude || '0'}</p>
              </>
            ) : (
              <p>Location information not available</p>
            )}
          </div>
          
          {/* Raw Data for Debugging */}
          <div className="data-item debug-section">
            <h4>Debug Information</h4>
            <p>Data properties: {Object.keys(info).join(', ')}</p>
            <details>
              <summary>View Raw Data</summary>
              <pre className="raw-data">{JSON.stringify(info, null, 2)}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vehicle; 