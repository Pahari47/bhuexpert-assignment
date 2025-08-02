# BHUExpert Real Estate Platform

A full-stack real estate platform built with React, TypeScript, Node.js, and MongoDB. The application allows users to browse properties, view them on a map, and explore nearby amenities.

## Features

- Property listing with detailed information
- Interactive map view with property markers
- Nearby amenities search using Google Maps API
- Advanced property filtering
- Responsive design for mobile and desktop
- Real-time property status updates

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Google Maps JavaScript API
- Modern React Hooks for state management

### Backend
- Node.js with TypeScript
- Express.js framework
- MongoDB for database
- RESTful API architecture

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed locally or MongoDB Atlas account
- Google Maps API key

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Pahari47/bhuexpert-assignment.git
cd bhuexpert-assignment
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create environment files:

Backend (.env):
```
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

Frontend (.env):
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:3000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Seed the database with sample data:
```bash
cd backend
npm run seed
```

The application should now be running at `http://localhost:5173`

## API Documentation

### Properties API

#### Get All Properties
- **GET** `/api/properties`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `city`: Filter by city
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `propertyType`: Type of property

#### Get Property by ID
- **GET** `/api/properties/:id`

#### Get Nearby Amenities
- **GET** `/api/properties/:id/amenities`
- Query Parameters:
  - `radius`: Search radius in meters (default: 1000)
  - `type`: Type of amenity (e.g., restaurant, school, hospital)

## Design Decisions and Trade-offs

### Architecture
- **Monorepo Structure**: Chose a monorepo setup for easier development and deployment
- **TypeScript**: Used throughout for better type safety and developer experience
- **Component Separation**: Clear separation between UI components and business logic

### State Management
- Used React hooks for state management instead of Redux
  - Trade-off: Simpler setup vs potentially more complex state management in larger scale
- Implemented custom hooks for reusable logic
  - `useGoogleMaps` for map integration
  - `useNearbyAmenities` for amenity fetching

### Performance Optimizations
- Implemented pagination for property listings
- Used Google Maps lazy loading
- Optimized images with appropriate sizing
- Implemented caching for amenity searches

## Future Improvements

1. Authentication & Authorization
   - User registration and login
   - Property owner dashboard
   - Role-based access control

2. Enhanced Search Features
   - Advanced filtering options
   - Search by drawing on map
   - Save search preferences

3. Performance Enhancements
   - Implement server-side rendering
   - Add Redis caching
   - Image optimization service

4. Additional Features
   - Property booking system
   - Virtual tours integration
   - Chat system for property inquiries
   - Email notifications
   - Property comparison tool

5. Testing
   - Add unit tests for components
   - Integration tests for API endpoints
   - End-to-end testing

6. Mobile Experience
   - Develop native mobile apps
   - Optimize images for mobile
   - Implement progressive web app features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
