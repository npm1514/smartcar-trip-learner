'use client';

interface VehicleInfoProps {
  vehicleData: any;
}

export default function VehicleInfo({ vehicleData }: VehicleInfoProps) {
  // Helper function to format data in a more readable way
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'Not available';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return value.toString();
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold">
          {vehicleData.year} {vehicleData.make} {vehicleData.model}
        </h2>
        <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1 rounded-full text-sm font-medium">
          Connected
        </div>
      </div>
      
      {/* Basic vehicle info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="vehicle-info">
          <h3>Basic Information</h3>
          <div className="data-row">
            <div className="data-label">Make</div>
            <div className="data-value">{vehicleData.make || 'Not available'}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Model</div>
            <div className="data-value">{vehicleData.model || 'Not available'}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Year</div>
            <div className="data-value">{vehicleData.year || 'Not available'}</div>
          </div>
          <div className="data-row border-0">
            <div className="data-label">ID</div>
            <div className="data-value font-mono text-sm">
              {vehicleData.id ? vehicleData.id.substring(0, 10) + '...' : 'Not available'}
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        {vehicleData.info && (
          <div className="vehicle-info">
            <h3>Additional Information</h3>
            {vehicleData.info.id && (
              <div className="data-row">
                <div className="data-label">VIN</div>
                <div className="data-value font-mono text-sm">{vehicleData.info.id}</div>
              </div>
            )}
            {vehicleData.info.tankSize && (
              <div className="data-row border-0">
                <div className="data-label">Tank Size</div>
                <div className="data-value">
                  {vehicleData.info.tankSize.value} {vehicleData.info.tankSize.unit}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Odometer */}
        {vehicleData.odometer && (
          <div className="vehicle-info">
            <h3>Odometer</h3>
            <div className="data-row border-0">
              <div className="data-label">Distance</div>
              <div className="data-value">
                <span className="text-xl font-bold">
                  {Math.round(vehicleData.odometer.distance/1.6)} miles
                </span> 
              </div>
            </div>
          </div>
        )}
        
        {/* Location */}
        {vehicleData.location && (
          <div className="vehicle-info">
            <h3>Location</h3>
            <div className="data-row">
              <div className="data-label">Latitude</div>
              <div className="data-value">{vehicleData.location.latitude}</div>
            </div>
            <div className="data-row border-0">
              <div className="data-label">Longitude</div>
              <div className="data-value">{vehicleData.location.longitude}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 