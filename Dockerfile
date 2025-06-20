# Stage 1: Build the React app
FROM node:21-alpine AS build

WORKDIR /policy-list-ui

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY ./ ./

# Build the React app
RUN npm run build

# Stage 2: Set up Nginx to serve the React app
FROM nginx:alpine

# Copy your custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy the built assets from the previous stage into the Nginx HTML directory
COPY --from=build /policy-list-ui/build /usr/share/nginx/html
