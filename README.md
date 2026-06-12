<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=CrowdQueue&fontSize=80&fontAlignY=35&desc=The%20Ultimate%20Real-Time%20Virtual%20Queue%20System&descAlignY=55&descSize=20" width="100%" alt="CrowdQueue Banner"/>

  <br />

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-16.2-000000.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101.svg?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <br />

  > **Eliminate physical lines. Empower your organization.**  
  > *A high-performance platform designed to handle large crowds, reduce wait times, and optimize user flows seamlessly.*

</div>

---

## ⚡ Overview

**CrowdQueue** is a high-performance, real-time queue management platform built to scale. Whether you're managing a busy restaurant, a large event, or a vital service center, CrowdQueue provides a frictionless virtual waiting experience. 

Empower your organization with live updates, dynamic staff dashboards, robust analytics, and automated multi-channel notifications.

---

## ✨ Peak Detailing & Features

<table>
  <tr>
    <td width="50%">
      <h3>🔄 Real-Time Synchronization</h3>
      <p>Instant queue updates across all client devices and staff dashboards using <b>Socket.io</b> backed by a <b>Redis Adapter</b> for true horizontal scalability.</p>
    </td>
    <td width="50%">
      <h3>👥 Robust Staff Management</h3>
      <p>Role-based access control (RBAC) allows administrators to delegate queue management to staff members securely and seamlessly.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📊 Smart Analytics</h3>
      <p>Deep dive into your organization's performance with interactive charts powered by <b>Recharts</b>, tracking peak hours, average wait times, and throughput.</p>
    </td>
    <td>
      <h3>🗺️ Geospatial Tracking</h3>
      <p>Integrated <b>React-Leaflet</b> maps for plotting queue locations, helping users easily find the nearest available services.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📱 Multi-Channel Notifications</h3>
      <p>Keep your users continuously informed via <b>SMS (Twilio)</b> and <b>Web Push Notifications</b> whenever their turn approaches.</p>
    </td>
    <td>
      <h3>⚙️ Background Jobs</h3>
      <p>Offload heavy tasks and scheduled notifications utilizing robust queues via <b>BullMQ</b> and <b>Redis</b>.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>🔲 Frictionless Onboarding</h3>
      <p>Scan-to-join printable QR Codes dynamically generated on the fly with <b>qrcode.react</b>.</p>
    </td>
    <td>
      <h3>🎨 Premium Aesthetics</h3>
      <p>Fully responsive, sleek UI utilizing <b>Tailwind CSS v4</b> and fluid micro-interactions powered by <b>Framer Motion</b>.</p>
    </td>
  </tr>
</table>

---

## 🎨 Tech Stack

<div align="center">

| **Domain** | **Technologies** |
| :--- | :--- |
| 🌐 **Frontend** | [Next.js 16](https://nextjs.org/) • [React 19](https://react.dev/) • [Tailwind CSS v4](https://tailwindcss.com/) • [Framer Motion](https://www.framer.com/motion/) |
| 🗄️ **Backend** | [Node.js](https://nodejs.org/) • [Express.js](https://expressjs.com/) • [MongoDB](https://www.mongodb.com/) • [Redis](https://redis.io/) |
| ⚡ **Real-Time** | [Socket.io](https://socket.io/) • `@socket.io/redis-adapter` |
| 🧠 **State & Data** | [Zustand](https://zustand-demo.pmnd.rs/) • [@tanstack/react-query](https://tanstack.com/query/latest) |
| 🛠️ **Workers/Jobs** | [BullMQ](https://docs.bullmq.io/) |
| 📊 **Visuals/Maps** | [Recharts](https://recharts.org/) • [React-Leaflet](https://react-leaflet.js.org/) |

</div>

---

## 📦 Project Architecture

```text
crowdqueue/
├── 🌈 client/             # Next.js Frontend Application
│   ├── src/app/           # Next.js App Router (Pages & Layouts)
│   ├── src/components/    # Reusable UI Components
│   ├── src/lib/           # Utilities, Socket singleton, APIs
│   └── src/store/         # Zustand Stores
│
├── ⚙️ server/              # Express.js Backend API
│   ├── src/controllers/   # Request handlers
│   ├── src/models/        # Mongoose Schemas
│   ├── src/routes/        # API route definitions
│   └── src/services/      # Business logic & integrations
│
└── 🔨 worker/              # (If applicable) Background Job Processors
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v20+)
- **MongoDB** instance (local or Atlas)
- **Redis Server** (local or Upstash)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/MayankRaj435/crowdqueue.git
cd crowdqueue
```

### 2️⃣ Environment Setup
Create a `.env` file in the project root for local development and set production variables in your hosting dashboard.

**`server/.env`:**
```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
# Add Twilio / Push Notification keys as required
```

**`client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3️⃣ Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install --legacy-peer-deps
```

### 4️⃣ Run the Development Servers

<details>
<summary><b>Click to show commands</b></summary>

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
</details>

The app will be glowing at [http://localhost:3000](http://localhost:3000) ✨

---

## 🚀 Production Deployment

The cleanest deployment path is:

1. Deploy the frontend to Vercel.
2. Deploy the backend API to Render or Railway.
3. Use MongoDB Atlas for the database.
4. Use Upstash Redis for Redis.

### Recommended env values

**Client on Vercel**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
```

**Server on Render / Railway**
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-vercel-app.vercel.app
MONGO_URI=mongodb+srv://...
REDIS_URL=rediss://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:admin@yourdomain.com
TWILIO_SID=...
TWILIO_TOKEN=...
TWILIO_PHONE=...
```

### Deployment steps

1. Create MongoDB Atlas and Upstash Redis accounts and copy the connection strings.
2. Deploy the server first so you have the API URL.
3. Add the server env vars in the host dashboard and redeploy.
4. Deploy the client to Vercel and set the client env vars to the live API URL.
5. Update `CLIENT_URL` on the server to the Vercel domain.
6. Test login, refresh, queue join, and socket updates in production.

### Notes

- `CLIENT_URL` can contain multiple comma-separated origins if you need local dev plus production, for example `http://localhost:3000,https://your-vercel-app.vercel.app`.
- The server uses httpOnly refresh cookies, so cross-site production deployments require `sameSite=None` and `secure=true`, which is now handled automatically.

---

## 🛡️ Security & Performance

- 🛑 **Rate Limiting**: Integrated `express-rate-limit` + `rate-limit-redis`.
- 🗜️ **Payload Compression**: Using `compression` middleware.
- 🔒 **Secure Headers**: Using `helmet` to protect against web vulnerabilities.

---

<div align="center">
  
  ## 🤝 Contributing
  Contributions, issues, and feature requests are highly welcome!  
  Check out the [issues page](https://github.com/MayankRaj435/crowdqueue/issues).

  <br />

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer" width="100%" alt="Footer Banner"/>
  
  <p><b>Built with ❤️ and styled for perfection.</b></p>
</div>
