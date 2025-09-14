# NeighBridge Backend

A location-based social platform backend built with Node.js, Express, TypeScript, and MongoDB. Connects neighbors and builds stronger local communities.

## 📋 Dependencies

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas Account**
- **Cloudinary Account** (for image uploads)

## ⚡ Setup Instructions

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

### 3. Database Setup
1. Create MongoDB Atlas cluster
2. Create database user and whitelist IP
3. Get connection string and update `MONGO_URI` in `.env`

### 4. Cloudinary Setup
1. Create Cloudinary account
2. Get API credentials from dashboard
3. Update Cloudinary variables in `.env`

## 🚀 Execution Steps

### Development
```bash
npm run dev
```
Server runs on `http://localhost:3000`

### Production
```bash
npm run build
npm start
```

### Verify Installation
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

## 🚨 Troubleshooting

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

---

**Built with ❤️ for stronger communities** 🏘️