FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose necessary ports
EXPOSE 3001
EXPOSE 9877/udp
EXPOSE 8081
EXPOSE 9000

# Command to start the Node.js server
CMD ["node", "server.js"]
