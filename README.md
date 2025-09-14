# NeighBridge Backend# NeighBridge Backend API# NeighBridge Backend API# NeighBridge Backend API<<<<<<< HEAD



Location-based social platform API built with Node.js, TypeScript, and MongoDB.



## DependenciesA location-based social platform backend built with Node.js, Express, TypeScript, and MongoDB.



- Node.js (v16+)

- MongoDB Atlas

- Cloudinary## 📋 DependenciesA location-based social platform backend built with Node.js, Express, TypeScript, and MongoDB.# NeighBridge_Backend



## Setup



```bash- **Node.js** (v16 or higher)

git clone https://github.com/Hackelite-4Loop/NeighBridge_Backend.git

cd NeighBridge_Backend- **npm** or **yarn**

npm install

```- **MongoDB Atlas Account**## 📋 DependenciesA location-based social platform backend built with Node.js, Express, TypeScript, and MongoDB. Connects neighbors and builds stronger local communities through location-based features, community management, and social interactions.=======



Create `.env`:- **Cloudinary Account** (for image uploads)

```

NODE_ENV=development

PORT=3000

MONGO_URI=your_mongodb_connection_string## ⚡ Setup Instructions

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name- **Node.js** (v16 or higher)# NeighBridge Backend API

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret### 1. Clone & Install

```

```bash- **npm** or **yarn**

## Run

git clone https://github.com/Hackelite-4Loop/NeighBridge_Backend.git

```bash

npm run devcd NeighBridge_Backend- **MongoDB Atlas Account**## 🚀 Features

```

npm install

Server starts at `http://localhost:3000`
```- **Cloudinary Account** (for image uploads)



### 2. Environment SetupA location-based social platform backend built with Node.js, Express, TypeScript, and MongoDB. Connects neighbors and builds stronger local communities.

Create a `.env` file in the root directory:

## ⚡ Setup Instructions

```env

NODE_ENV=development### ✅ Implemented Features

PORT=3000

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neighbridge### 1. Clone & Install

JWT_SECRET=your-super-secret-jwt-key-here

JWT_EXPIRES_IN=7d```bash- **User Authentication** - JWT-based auth with secure password hashing## ✅ What's Built So Far

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name

CLOUDINARY_API_KEY=your-cloudinary-api-keygit clone https://github.com/Hackelite-4Loop/NeighBridge_Backend.git

CLOUDINARY_API_SECRET=your-cloudinary-api-secret

```cd NeighBridge_Backend- **Location Services** - Geospatial indexing for location-based queries



### 3. MongoDB Setupnpm install

1. Create MongoDB Atlas cluster

2. Create database user and whitelist IP```- **Community Management** - Create and manage location-based communities### 🏗️ Core System

3. Get connection string and update `MONGO_URI` in `.env`



### 4. Cloudinary Setup

1. Create Cloudinary account### 2. Environment Setup- **Event System** - Create and manage community events- **Express.js + TypeScript** server with MongoDB database

2. Get API credentials from dashboard

3. Update Cloudinary variables in `.env`Create a `.env` file in the root directory:



## 🚀 Execution Steps- **Post System** - Social posts with media support- **JWT Authentication** with secure password hashing



### Development```env

```bash

npm run devNODE_ENV=development- **Issue Reporting** - Community issue tracking and reporting- **Location-based features** using MongoDB geospatial indexing

```

Server runs on `http://localhost:3000`PORT=3000



### ProductionMONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neighbridge- **File Uploads** - Cloudinary integration for images and media- **Image upload** integration with Cloudinary

```bash

npm run buildJWT_SECRET=your-super-secret-jwt-key-here

npm start

```JWT_EXPIRES_IN=7d- **Real-time Notifications** - System notifications for users- **Input validation** and error handling middleware



### Verify InstallationCLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name

```bash

curl http://localhost:3000/healthCLOUDINARY_API_KEY=your-cloudinary-api-key- **Admin Panel** - System administration features

```

CLOUDINARY_API_SECRET=your-cloudinary-api-secret

## 📡 API Endpoints

```### 👥 User Management

### Public

- `GET /health` - Health check

- `POST /api/users/register` - User registration

- `POST /api/users/login` - User login### 3. MongoDB Setup## 📋 Prerequisites- User registration/login with email validation



### Protected (require JWT)1. Create MongoDB Atlas cluster

- `GET /api/users/profile` - User profile

- `PUT /api/users/location` - Update location2. Create database user and whitelist IP- Profile management with location updates

- `GET /api/users/nearby` - Find nearby users

- `POST /api/communities` - Create community3. Get connection string and update `MONGO_URI` in `.env`

- `GET /api/communities/nearby` - Find communities

- `POST /api/communities/:id/join` - Join communityBefore you begin, ensure you have the following installed:- Avatar uploads via Cloudinary

- `GET /api/events` - Get events

- `POST /api/events` - Create event### 4. Cloudinary Setup

- `GET /api/posts` - Get posts

- `POST /api/posts` - Create post1. Create Cloudinary account- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)- Find nearby users within specified radius

- `GET /api/issues` - Get issues

- `POST /api/issues` - Report issue2. Get API credentials from dashboard



## 🛠️ Tech Stack3. Update Cloudinary variables in `.env`- **npm** or **yarn** package manager



- Node.js, Express.js, TypeScript

- MongoDB with Mongoose ODM

- JWT Authentication## 🚀 Execution Steps- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/atlas)### 🏘️ Community System

- Cloudinary for file uploads

- bcrypt for password hashing

### Development- **Cloudinary Account** - [Sign up](https://cloudinary.com/) (for image uploads)- Create location-based communities with coverage radius

```bash

npm run dev- **Git** - [Download](https://git-scm.com/)- Join/leave communities with role management

```

Server runs on `http://localhost:3000`- Discover communities near user location



### Production## ⚡ Quick Start- Distance calculations between users and communities

```bash

npm run build

npm start

```### 1. Clone Repository## � Quick Start



### Verify Installation```bash

```bash

curl http://localhost:3000/healthgit clone https://github.com/Hackelite-4Loop/NeighBridge_Backend.git1. **Install dependencies**

```

cd NeighBridge_Backend   ```bash

## 📡 API Endpoints

```   npm install

### Public

- `GET /health` - Health check   ```

- `POST /api/users/register` - User registration

- `POST /api/users/login` - User login### 2. Install Dependencies



### Protected (require JWT)```bash2. **Environment Setup** - Create `.env` file with your configuration values

- `GET /api/users/profile` - User profile

- `PUT /api/users/location` - Update locationnpm install

- `GET /api/users/nearby` - Find nearby users

- `POST /api/communities` - Create community```3. **Start server**

- `GET /api/communities/nearby` - Find communities

- `POST /api/communities/:id/join` - Join community   ```bash

- `GET /api/events` - Get events

- `POST /api/events` - Create event### 3. Environment Configuration   npm run dev

- `GET /api/posts` - Get posts

- `POST /api/posts` - Create post   ```

- `GET /api/issues` - Get issues

- `POST /api/issues` - Report issueCreate a `.env` file in the root directory with the following variables:



## 🛠️ Tech Stack4. **Test API**



- Node.js, Express.js, TypeScript```env   ```bash

- MongoDB with Mongoose ODM

- JWT Authentication# Server Configuration   curl http://localhost:3000/health

- Cloudinary for file uploads

- bcrypt for password hashingNODE_ENV=development   ```

PORT=3000

## � API Endpoints

# MongoDB Configuration

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neighbridge?retryWrites=true&w=majority### Public Routes
# NeighBridge Backend API

A location-based social platform backend built with Node.js, Express, TypeScript, and MongoDB. Connects neighbors and builds stronger local communities.

## 🚀 Features

- **User Authentication** - JWT-based auth with secure password hashing
- **Location Services** - Geospatial indexing for location-based queries
- **Community Management** - Create and manage location-based communities
- **Event System** - Create and manage community events
- **Post System** - Social posts with media support
- **Issue Reporting** - Community issue tracking and reporting
- **File Uploads** - Cloudinary integration for images and media
- **Real-time Notifications** - System notifications for users
- **Admin Panel** - System administration features

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas Account**
- **Cloudinary Account** (for image uploads)

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Hackelite-4Loop/NeighBridge_Backend.git
cd NeighBridge_Backend
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/neighbridge
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Verify Installation
```bash
curl http://localhost:3000/health
```

## 📡 API Endpoints

### Public Routes
- `GET /health` - Health check
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Protected Routes (require JWT token)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/nearby` - Find nearby users
- `POST /api/communities` - Create community
- `GET /api/communities/nearby` - Find nearby communities
- `POST /api/communities/:id/join` - Join community
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create post
- `GET /api/issues` - Get issues
- `POST /api/issues` - Report issue

## 🛠️ Development Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
```

## 🗂️ Project Structure

```
src/
├── modules/
│   ├── users/              # User management & authentication
│   ├── communities/        # Community management
│   ├── events/            # Event management
│   ├── posts/             # Social posts
│   ├── issue/             # Issue reporting
│   ├── notifications/     # Notifications system
│   └── System-admin/      # Admin functionality
├── middleware/            # Auth, validation, error handling
├── config/               # Database and Cloudinary setup
└── utils/                # Helper functions and JWT utilities
```

## 🔧 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **File Upload**: Cloudinary
- **Validation**: express-validator
- **Development**: nodemon, ts-node

## � Troubleshooting

### MongoDB Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Try changing DNS to 8.8.8.8 or 1.1.1.1

### Port Already in Use
```bash
npx kill-port 3000
# Or use different port: PORT=3001 npm run dev
```

### Environment Variables Not Loading
- Verify `.env` file exists in root directory
- Check `.env` file formatting (no spaces around =)
- Restart server after changes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for stronger communities** 🏘️

├── middleware/         # Auth, validation, error handling

1. **Create Cloudinary Account**: [Sign up here](https://cloudinary.com/)├── config/            # Database and Cloudinary setup

2. **Get API Credentials**: Dashboard → Account Details└── utils/             # Helper functions and JWT utilities

3. **Update Environment Variables**: Add your cloud name, API key, and API secret to `.env````



### 6. Start Development Server## 🧪 Testing

```bash- `node test-db-connection.js` - Test MongoDB connection

npm run dev- `node test-user-creation.js` - Test user creation

```- Health endpoint: `curl http://localhost:3000/health`



The server will start on `http://localhost:3000`##  What's Next

- Event management system

### 7. Verify Installation- Post and social interaction features

```bash- Real-time notifications

curl http://localhost:3000/health- Admin dashboard

```



Should return: `{"status":"OK","message":"NeighBridge API is running"}`>>>>>>> development


## 🛠️ Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## 📡 API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer your-jwt-token-here
```

### Public Endpoints

#### Health Check
```http
GET /health
```

#### User Authentication
```http
POST /api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "password123",
  "location": {
    "type": "Point",
    "coordinates": [-74.006, 40.7128]
  }
}
```

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints (Require JWT)

#### User Management
```http
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/location
GET /api/users/nearby?radius=5000
```

#### Community Management
```http
GET /api/communities/nearby?lat=40.7128&lng=-74.006&radius=5000
POST /api/communities
GET /api/communities/:id
PUT /api/communities/:id
POST /api/communities/:id/join
POST /api/communities/:id/leave
```

#### Events
```http
GET /api/events
POST /api/events
GET /api/events/:id
PUT /api/events/:id
DELETE /api/events/:id
```

#### Posts
```http
GET /api/posts
POST /api/posts
GET /api/posts/:id
PUT /api/posts/:id
DELETE /api/posts/:id
```

#### Issues
```http
GET /api/issues
POST /api/issues
GET /api/issues/:id
PUT /api/issues/:id
DELETE /api/issues/:id
```

## 🗂️ Project Structure

```
src/
├── modules/
│   ├── users/              # User management & authentication
│   │   ├── user.controller.ts
│   │   ├── user.model.ts
│   │   ├── user.routes.ts
│   │   └── user.service.ts
│   ├── communities/        # Community management
│   │   ├── community.controller.ts
│   │   ├── community.model.ts
│   │   ├── community.routes.ts
│   │   ├── community.service.ts
│   │   └── membership.model.ts
│   ├── events/            # Event management
│   ├── posts/             # Social posts
│   ├── issue/             # Issue reporting
│   ├── notifications/     # Notifications system
│   └── System-admin/      # Admin functionality
├── middleware/
│   ├── auth.ts           # JWT authentication
│   ├── validation.ts     # Request validation
│   └── errorHandler.ts   # Error handling
├── config/
│   ├── db.ts            # MongoDB configuration
│   └── cloudinary.ts    # Cloudinary configuration  
├── utils/
│   ├── jwt.ts           # JWT utilities
│   └── helpers.ts       # Helper functions
├── app.ts               # Express app configuration
└── server.ts            # Server entry point
```

## 🔧 Configuration Details

### MongoDB Configuration
The app uses MongoDB with geospatial indexing for location-based features:
- **2dsphere indexes** for location queries
- **Connection pooling** for optimal performance
- **Retry logic** for connection resilience

### JWT Configuration
- **Secure token generation** with configurable expiration
- **Middleware protection** for private routes
- **Role-based access control** for admin features

### File Upload Configuration
- **Cloudinary integration** for secure file uploads
- **Signed upload URLs** for direct client uploads
- **Image optimization** and transformation

## 🚨 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# DNS issues - try changing DNS to 8.8.8.8
# Check MongoDB Atlas IP whitelist
# Verify connection string format
```

#### Port Already in Use
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

#### Environment Variables Not Loading
```bash
# Verify .env file exists in root directory
# Check .env file formatting (no spaces around =)
# Restart development server after changes
```

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test user registration
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123"}'
```

### Database Testing
The application includes comprehensive error handling and connection diagnostics to help identify and resolve database connectivity issues.

## 🚀 Deployment

### Environment Setup
1. **Production Environment Variables**: Update `.env` with production values
2. **Database**: Use MongoDB Atlas production cluster
3. **File Storage**: Configure Cloudinary for production
4. **Security**: Use strong JWT secrets and secure connections

### Build for Production
```bash
npm run build
npm start
```

=

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **File Upload**: Cloudinary
- **Validation**: express-validator
- **Development**: nodemon, ts-node

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ for stronger communities** 🏘️