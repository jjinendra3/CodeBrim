# Use the official Docker image as the base image
FROM docker:20.10.12-dind

# Install Node.js
RUN apk add --update nodejs npm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the Node.js app runs on
EXPOSE 5000

# Define the command to run the Node.js app
CMD ["npm", "start"]
