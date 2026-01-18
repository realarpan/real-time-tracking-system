# Real-Time Tracking System

🚀 A full-stack real-time location tracking system with live updates, WebSocket support, and interactive mapping.

## 🎯 Features

- **Real-time Location Tracking**: Live GPS tracking with WebSocket updates
- **Interactive Maps**: Leaflet-based map visualization
- **User Authentication**: JWT-based authentication system
- **Device Management**: Track multiple devices per user
- **Location History**: Store and retrieve location history
- **Real-time Notifications**: WebSocket-based real-time notifications
- **Responsive Design**: Mobile-friendly interface
- **Dashboard**: Comprehensive dashboard for tracking
- **API Documentation**: Full REST API with Swagger
- **Database**: MongoDB for scalable data storage

## 🛠 Tech Stack

### Frontend
- **Next.js 14+** - React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Socket.io Client** - Real-time communication
- **React Query** - Data fetching and state management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **Socket.io** - WebSocket support
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Cors** - Cross-origin support

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PM2** - Process manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
real-time-tracking-system/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App directory
│   ├── components/          # React components
│   ├── pages/              # Page routes
│   ├── public/             # Static files
│   ├── styles/             # CSS/SCSS
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   └── package.json
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── config/         # Configuration files
│   │   └── app.ts          # Express app setup
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml        # Docker orchestration
├── .gitignore
├── README.md
└── LICENSE
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB 5.0+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/realarpan/real-time-tracking-system.git
   cd real-time-tracking-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URI and other configs
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Docs: http://localhost:5000/api/docs

## 🐳 Docker Setup

```bash
docker-compose up -d
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Devices
- `GET /api/devices` - Get all user devices
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Tracking
- `POST /api/tracking/update` - Update location
- `GET /api/tracking/history` - Get location history
- `GET /api/tracking/current` - Get current location
- `GET /api/tracking/stats` - Get tracking statistics

## 🔌 WebSocket Events

### Client to Server
- `location:update` - Send location update
- `device:register` - Register device
- `tracking:start` - Start tracking
- `tracking:stop` - Stop tracking

### Server to Client
- `location:updated` - Location updated
- `device:connected` - Device connected
- `tracking:started` - Tracking started
- `error` - Error occurred

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/tracking
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

## 📖 Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

### Create a device
```bash
curl -X POST http://localhost:5000/api/devices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Phone", "deviceType": "mobile"}'
```

### Update location
```bash
curl -X POST http://localhost:5000/api/tracking/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device_id", "latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}'
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd ../frontend
npm run test
```

## 📦 Deployment

### Deploy to Vercel (Frontend)
```bash
vercel
```

### Deploy to Heroku (Backend)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Arpan Rej** - Full Stack Developer
- GitHub: [@realarpan](https://github.com/realarpan)
- Email: your.email@example.com

## 📞 Support

For support, email your.email@example.com or create an issue on GitHub.

## 🙏 Acknowledgments

- Socket.io documentation
- Next.js documentation
- Express.js community
- MongoDB Atlas

---

**Made with ❤️ by Arpan Rej**
