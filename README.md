# Real-Time Tracking System

A full-stack real-time location tracking system featuring live GPS updates, WebSocket communication, and interactive map visualization.

---

## 🎯 Features

| Feature | Description |
|---|---|
| **Real-Time Location Tracking** | Live GPS tracking with WebSocket updates |
| **Interactive Maps** | Leaflet-powered map visualization |
| **User Authentication** | JWT-based authentication system |
| **Device Management** | Track multiple devices per user |
| **Location History** | Store and retrieve location history |
| **Real-Time Notifications** | WebSocket-based notifications |
| **Responsive Design** | Mobile-friendly interface |
| **Dashboard** | Comprehensive tracking dashboard |
| **API Documentation** | REST API with Swagger |
| **Database** | MongoDB for scalable data storage |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 14+ | React framework with SSR |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| Leaflet | Interactive maps |
| Socket.io Client | Real-time communication |
| React Query | Data fetching and state management |
| Axios | HTTP client |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| TypeScript | Type-safe backend |
| Socket.io | WebSocket support |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Cors | Cross-origin support |

### DevOps & Tools

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| PM2 | Process manager |
| ESLint | Code linting |
| Prettier | Code formatting |

---

## 📁 Project Structure

```text
real-time-tracking-system/
│
├── frontend/                      # Next.js frontend
│   ├── app/                       # App directory
│   ├── components/                # React components
│   ├── pages/                     # Page routes
│   ├── public/                    # Static files
│   ├── styles/                    # CSS/SCSS
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utilities and helpers
│   └── package.json
│
├── backend/                       # Express backend
│   ├── src/
│   │   ├── controllers/            # Route handlers
│   │   ├── models/                 # MongoDB schemas
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Custom middleware
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Helper functions
│   │   ├── config/                 # Configuration files
│   │   └── app.ts                  # Express app setup
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml              # Docker orchestration
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are available in your development environment:

- Node.js 16+
- npm or yarn
- MongoDB 5.0+
- Docker (optional)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/realarpan/real-time-tracking-system.git
cd real-time-tracking-system
```

#### 2. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Update the `.env` file with your MongoDB URI and other required configuration values.

Start the backend development server:

```bash
npm run dev
```

#### 3. Install and start the frontend

Open a separate terminal and run:

```bash
cd frontend
npm install
npm run dev
```

#### 4. Access the application

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:5000` |
| API Documentation | `http://localhost:5000/api/docs` |

---

## 🐳 Docker Setup

Start the application using Docker Compose:

```bash
docker-compose up -d
```

---

## 📚 API Endpoints

The backend provides REST API endpoints for authentication, device management, and location tracking.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in a user |
| `POST` | `/api/auth/logout` | Log out a user |
| `GET` | `/api/auth/me` | Get the current user |

### Devices

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/devices` | Get all user devices |
| `POST` | `/api/devices` | Create a new device |
| `GET` | `/api/devices/:id` | Get device details |
| `PUT` | `/api/devices/:id` | Update a device |
| `DELETE` | `/api/devices/:id` | Delete a device |

### Tracking

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tracking/update` | Update a location |
| `GET` | `/api/tracking/history` | Get location history |
| `GET` | `/api/tracking/current` | Get the current location |
| `GET` | `/api/tracking/stats` | Get tracking statistics |

---

## 🔌 WebSocket Events

Real-time communication is handled through Socket.io events.

### Client → Server

| Event | Description |
|---|---|
| `location:update` | Send a location update |
| `device:register` | Register a device |
| `tracking:start` | Start tracking |
| `tracking:stop` | Stop tracking |

### Server → Client

| Event | Description |
|---|---|
| `location:updated` | Location updated |
| `device:connected` | Device connected |
| `tracking:started` | Tracking started |
| `error` | Error occurred |

---

## 🔐 Environment Variables

Configure the following environment variables before starting the application.

### Backend — `.env`

```env
MONGODB_URI=mongodb://localhost:27017/tracking
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

---

## 📖 Usage Examples

The following examples demonstrate how to interact with the API using `curl`.

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

### Update a location

```bash
curl -X POST http://localhost:5000/api/tracking/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device_id", "latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}'
```

---

## 🧪 Testing

### Backend tests

```bash
cd backend
npm run test
```

### Frontend tests

```bash
cd ../frontend
npm run test
```

---

## 📦 Deployment

### Frontend — Vercel

Deploy the frontend to Vercel:

```bash
vercel
```

### Backend — Heroku

Deploy the backend to Heroku:

```bash
heroku login
heroku create your-app-name
git push heroku main
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. Commit your changes:

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. Push your branch:

   ```bash
   git push origin feature/AmazingFeature
   ```

5. Open a Pull Request.

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Arpan** — Full Stack Developer

- GitHub: [@realarpan](https://github.com/realarpan)
- Email: `highly classified`

---

## 📞 Support

For support, email `highly classified` or create an issue on GitHub.

---

## 🙏 Acknowledgments

- [Socket.io Documentation](https://socket.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Community](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

---

<div align="center">

**Made with ❤️ by Arpan**

</div>
