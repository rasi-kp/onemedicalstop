# Use the official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json .

# Install dependencies
RUN npm install

# Copy application code to the container
COPY . .
# COPY .env /app/

# Expose the port the application runs on
EXPOSE 3000

# Define the command to run when the container starts
CMD ["npm", "start"]
