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
    <div className="card max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold">
          {vehicleData.year} {vehicleData.make} {vehicleData.model}
        </h2>
        <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1 rounded-full text-sm font-medium">
          Connected
        </div>
      </div>

      {/* Basic vehicle info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        {/* Battery/Fuel Display */}
        {vehicleData.battery && (
          <div className="vehicle-info">
            <h2 className="text-xl font-bold mb-4">
              {vehicleData.battery.type === 'ev' ? 'Battery Status' : 'Fuel Status'}
            </h2>
            <div className="data-row">
              <div className="data-label">Level</div>
              <div className="data-value">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                  <div
                    className={`h-2.5 rounded-full ${vehicleData.battery.percentRemaining > .50
                      ? 'bg-green-600'
                      : vehicleData.battery.percentRemaining > .20
                        ? 'bg-yellow-400'
                        : 'bg-red-600'
                      }`}
                    style={{ width: `${vehicleData.battery.percentRemaining * 100}%` }}
                  ></div>
                </div>
                <span className="font-semibold">{vehicleData.battery.percentRemaining * 100}%</span>
              </div>
            </div>
            {vehicleData.battery.range && (
              <div className="data-row border-0">
                <div className="data-label">Estimated Range</div>
                <div className="data-value">
                  <span className="text-lg font-semibold">
                    {Math.round(vehicleData.battery.range / 1.6)}
                  </span>
                  <span className="ml-1">miles</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Odometer */}
        {vehicleData.odometer && (
          <div className="vehicle-info">
            <h3>Odometer</h3>
            <div className="data-row border-0">
              <div className="data-label">Distance</div>
              <div className="data-value">
                <span className="text-xl font-bold">
                  {Math.round(vehicleData.odometer.distance / 1.6)} miles
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

      {/* Limited Data Notice */}
      {!vehicleData.battery && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg">
          <h3 className="font-medium mb-2">Limited Data Available</h3>
          <p className="text-sm">
            Your vehicle manufacturer restricts access to some data (like battery level or fuel information).
            This is normal and varies by manufacturer and model. Basic location and odometer data is still available.
          </p>
        </div>
      )}
    </div>
  );
} 