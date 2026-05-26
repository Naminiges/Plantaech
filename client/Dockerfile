FROM node:20

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Pass in the API URL from Railway environment variables at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose the port Railway uses (or fallback to 3000)
ENV PORT=3000
EXPOSE 3000

# Start the server using serve and the SPA flag (-s)
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
