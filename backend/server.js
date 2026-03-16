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
// We mount the auth routes at the root because React expects POST /token
app.use('/', require('./routes/authRoutes'));

// Check subscription status before allowing any write requests
app.use(checkActiveSubscription);

// Mount Phase 3 routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/v1/organization', organizationRoutes);
app.use('/organization', organizationRoutes);

app.use('/api/v1/users', userRoutes);
app.use('/users', userRoutes);

const holidayRoutes = require('./routes/holidayRoutes');
const roleRoutes = require('./routes/roleRoutes');
const policyRoutes = require('./routes/policyRoutes');

app.use('/api/v1/holidays', holidayRoutes);
app.use('/holidays', holidayRoutes);

app.use('/api/v1/roles', roleRoutes);
app.use('/roles', roleRoutes);

app.use('/api/v1/policies', policyRoutes);
app.use('/policies', policyRoutes);

// Phase 4 Routes
const billingRoutes = require('./routes/billingRoutes');
app.use('/api/v1/billing', billingRoutes);
app.use('/billing', billingRoutes);

//app.use('/api/v1/attendance', attendanceRoutes);
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/v1/attendance',attendanceRoutes)
app.use('/attendance', attendanceRoutes);

const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/v1/leaves', leaveRoutes);
app.use('/leaves', leaveRoutes);

const assetRoutes = require('./routes/assetRoutes');
app.use('/api/v1/assets', assetRoutes);
app.use('/assets', assetRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/v1/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Office SaaS APIs (Express) are running" });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
