# Smartcar Vehicle Dashboard

A React application that connects to the Smartcar API to view your vehicle's data.

## Project Structure

- `frontend/`: React application for the user interface
- `backend/`: Node.js Express server for secure API interactions

## Prerequisites

- Node.js and npm installed
- A Smartcar developer account and API credentials

## Setup

1. Clone this repository
   ```
   git clone https://github.com/your-username/smartcar-trip-learner.git
   cd smartcar-trip-learner
   ```

2. Install dependencies for both frontend and backend
   ```
   # Frontend dependencies
   cd frontend
   npm install
   
   # Backend dependencies
   cd ../backend
   npm install
   ```

3. Update environment variables:
   
   **Backend (.env file in backend folder)**
   ```
   CLIENT_ID=your-smartcar-client-id
   CLIENT_SECRET=your-smartcar-client-secret
   REDIRECT_URI=https://javascript-sdk.smartcar.com/v2/redirect?app_origin=http://localhost:3000
   PORT=8000
   ```

   **Frontend (.env file in frontend folder)**
   ```
   REACT_APP_CLIENT_ID=your-smartcar-client-id
   REACT_APP_REDIRECT_URI=https://javascript-sdk.smartcar.com/v2/redirect?app_origin=http://localhost:3000
   REACT_APP_SERVER_URL=http://localhost:8000
   ```

## Running the Application

1. Start the backend server:
   ```
   cd api
   npm start
   ```

2. In a new terminal, start the frontend application:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. Click the "Connect My Vehicle" button to initiate the Smartcar Connect flow.
2. You'll be redirected to Smartcar Connect for authentication.
3. After authorization, the app will display your vehicle information including:
   - Make, model, and year
   - VIN number
   - Current odometer reading
   - Current location coordinates

## Testing

This app is configured to use Smartcar's test mode by default, which means:

- You can use any username/password combination to login
- You can select any vehicle brand to test with
- All vehicle data is simulated

To connect to a real vehicle, change the `mode` parameter from `'test'` to `'live'` in `frontend/src/App.js`.

## Troubleshooting

- Make sure both frontend and backend servers are running
- Verify your Smartcar credentials are correct in both .env files
- Check browser console and server logs for error messages 