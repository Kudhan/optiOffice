# OptiFlow 🏢✨

Welcome to **OptiFlow** (formerly Office SaaS Management System). This project represents a comprehensive, multi-tenant enterprise solution designed to streamline workforce operations—from attendance and task tracking to leave management and billing.

Recently, the OptiFlow ecosystem underwent a massive architectural migration and UI modernization to meet 2026 SaaS standards.

---

## 🏗️ Architectural Shift

### The Move to Node.js / Express
The legacy application was built on Python and FastAPI. While functional, expanding the application to a multi-tenant capability required a more unified, modern stack.

By migrating the backend to **Node.js and Express**, we achieved:
1. **Single-Language Stack:** Both the React frontend and Express backend now share JavaScript/TypeScript paradigms, drastically reducing context-switching for developers and allowing for shared utility libraries.
2. **Asynchronous Scalability:** Node.js's native non-blocking I/O model handles high-concurrency requests—essential for a SaaS platform where hundreds of tenants might be clocking in, fetching dashboards, and updating tasks simultaneously.
3. **Mongoose Aggregation Engine:** We replaced static, hardcoded dashboard metrics with native MongoDB Aggregation pipelines. The backend computationally crunches active tasks, pending leaves, and total employees directly at the database layer before delivering lightning-fast JSON to the client.

### The "Stitch" Design System (Tailwind CSS)
The frontend was previously governed by fragmented, traditional CSS files. We have completely rewritten the interface using **Tailwind CSS**.

The new aesthetic is built on a **Bento Box Grid Layout** featuring:
* **Glassmorphism:** Leveraging utility classes like `bg-white/70 backdrop-blur-md` to create depth and visual hierarchy.
* **Floating Components:** The sidebar is un-docked (`m-4 rounded-2xl`), floating above the application background to feel lightweight and modern.
* **Micro-Interactions:** Consistent `hover:scale-[1.02] transition-transform` and router-based `animate-fade-in` logic ensure the application feels alive and responsive. The components are "stitched" perfectly to the state, ensuring smooth rerenders rather than page jolts.

### Security & Multi-Tenancy Isolation
Security in a SaaS application is not an afterthought; it is the foundation.

1. **JWT-Based State:** Authentication is handled by stateless JSON Web Tokens.
2. **Tenant Data Isolation:** When a user logs in, their exact `tenantId` is encoded into their JWT. On every subsequent request, the `authMiddleware` injects this `req.tenantId` into the controller context. Mongoose automatically filters **all** `find()` operations by `tenantId`. A user from "Company A" is cryptographically and logically walled off from data belonging to "Company B".
3. **SaaS Billing Middleware:** A global middleware layer intercepts mutations based on the tenant's current subscription tier. If an account drops to "Past Due", write operations are halted, returning a `402 Payment Required` to the frontend—which smoothly catches this error in a custom Axios interceptor and redirects them.

---

## 📡 Core API Documentation

The backend adheres strictly to REST principles mapped under the `/api/v1` namespace.

### 1. Authentication (`POST /api/v1/auth/login`)
Accepts form-urlencoded credentials and returns a secure JWT.
* **Request (application/x-www-form-urlencoded):**
  * `username`: string
  * `password`: string
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbG...",
    "token_type": "bearer"
  }
  ```

### 2. Dashboard Analytics (`GET /api/v1/dashboard`)
Returns the tenant's Mongoose-aggregated statistics and current tasks.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  {
    "message": "Welcome back, Admin",
    "stats": {
      "totalEmployees": 15,
      "activeTasks": 5,
      "pendingLeaves": 2
    },
    "tasks": ["Complete Q1 Report", "Review Leave Request"]
  }
  ```

### 3. Users Collection (`GET /api/v1/users`)
Retrieves users strictly isolated by the requesting user's `tenantId`.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "60d...1",
      "username": "jdoe",
      "email": "jdoe@company.com",
      "role": "employee",
      "tenantId": "company_1"
    }
  ]
  ```

### 4. Billing Verification (`GET /api/v1/billing`)
Returns current SaaS subscription details for the tenant.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  {
    "id": "60d...2",
    "planType": "Pro",
    "status": "Active",
    "nextPaymentDate": "2026-04-15"
  }
  ```

---

## 🚀 The OptiFlow v2.0 Roadmap

While the foundation is solidly built for scale, the following high-value features are scheduled for development in **OptiFlow v2.0**:

1. **🤖 AI-Automated Shift Scheduling:** Integrated machine learning to automatically generate weekly shifts based on historically approved leaves, employee preferences, and predicted foot-traffic/workload.
2. **💬 Real-Time WebSockets & Notifications:** Implementing Socket.io to deliver instant popup notifications for task assignments and leave approvals without requiring the user to refresh the Dashboard.
3. **🔌 Enterprise Integrations (Slack/Teams):** Full Webhook support allowing the Office SaaS system to push daily attendance digests and quick-approve Leave requests directly into the client's corporate Slack or Microsoft Teams channels.