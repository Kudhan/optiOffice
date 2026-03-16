require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


// Connect to MongoDB
connectDB();

const app = express();

const { checkActiveSubscription } = require('./middleware/billingMiddleware');
const errorHandler = require('./middleware/errorHandler');

// Middleware
app.use(cors());
// Crucial: The python endpoint accepts application/x-www-form-urlencoded data from the frontend
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
// Authentication strictly under /api/v1/auth
app.use('/api/v1/auth', require('./routes/authRoutes'));

// Fallback for variant auth pathing
app.use('/auth', require('./routes/authRoutes')); 

// Fallback for legacy /token if needed (optional based on user request " correttamente hits /api/v1/auth/token")
app.use('/', require('./routes/authRoutes')); 

// Check subscription status before allowing any write requests
app.use(checkActiveSubscription);

// Mount Phase 3 & 4 routes under /api/v1
const dashboardRoutes = require('./routes/dashboardRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userRoutes = require('./routes/userRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const roleRoutes = require('./routes/roleRoutes');
const policyRoutes = require('./routes/policyRoutes');
const billingRoutes = require('./routes/billingRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const assetRoutes = require('./routes/assetRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/organization', organizationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/holidays', holidayRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Legacy/Alternative Mounts (Ensuring standard bento boxes work)
app.use('/dashboard', dashboardRoutes);
app.use('/organization', organizationRoutes);
app.use('/users', userRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Office SaaS APIs (Express) are running" });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
