# Build Stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the React application
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine

# Copy the built assets from the build stage to Nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (Internally mapped to 3000 in compose)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
