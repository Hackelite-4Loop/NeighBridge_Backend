# NeighBridge Backend API

A location-based social platform backend built with Node.js, Express, TypeScript, and MongoDB. Connects neighbors and builds stronger local communities.

## ✅ What's Built So Far

### 🏗️ Core System
- **Express.js + TypeScript** server with MongoDB database
- **JWT Authentication** with secure password hashing
- **Location-based features** using MongoDB geospatial indexing
- **Image upload** integration with Cloudinary
- **Input validation** and error handling middleware

### 👥 User Management
- User registration/login with email validation
- Profile management with location updates
- Avatar uploads via Cloudinary
- Find nearby users within specified radius

### 🏘️ Community System
- Create location-based communities with coverage radius
- Join/leave communities with role management
- Discover communities near user location
- Distance calculations between users and communities

## � Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup** - Create `.env` file with your configuration values

3. **Start server**
   ```bash
   npm run dev
   ```

4. **Test API**
   ```bash
   curl http://localhost:3000/health
   ```

## � API Endpoints

### Public Routes
- `GET /health` - Health check (verifies server is running)
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Protected Routes (requires JWT token)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/nearby` - Find nearby users
- `POST /api/communities` - Create community
- `GET /api/communities/nearby` - Find nearby communities
- `POST /api/communities/:id/join` - Join community

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT tokens, bcrypt password hashing
- **File Upload**: Cloudinary for images
- **Validation**: express-validator

## 📁 Project Structure
```
src/
├── modules/
│   ├── users/          # User management
│   └── communities/    # Community system
├── middleware/         # Auth, validation, error handling
├── config/            # Database and Cloudinary setup
└── utils/             # Helper functions and JWT utilities
```

## 🧪 Testing
- `node test-db-connection.js` - Test MongoDB connection
- `node test-user-creation.js` - Test user creation
- Health endpoint: `curl http://localhost:3000/health`

##  What's Next
- Event management system
- Post and social interaction features
- Real-time notifications
- Admin dashboard

---
Built with ❤️ for stronger communities
