# Use Node.js as base image
FROM node:21-alpine3.18

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript files
RUN npx tsc

# Remove SQLite database file if exists (optional)
RUN rm -f database.sqlite

# Run Sequelize migrations
RUN npm rebuild sqlite3
RUN npx sequelize-cli db:migrate

# Expose port
EXPOSE $PORT

# Command to run the application
CMD [ "node", "dest/index.js" ]
