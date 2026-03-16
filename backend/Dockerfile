# Use official Node.js Alpine image for a smaller footprint
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the backend files
COPY . .

# Expose the API port
EXPOSE 8000

# Set Node Env to production
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "server.js"]
