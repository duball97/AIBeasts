# Use Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose the server port
EXPOSE 5000

# Command to run the server
CMD ["node", "server.js"]
