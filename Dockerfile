# Use official Deno image (latest 2.x with lockfile v5 support)
FROM denoland/deno:latest

# Set working directory
WORKDIR /app

# Copy dependency files first (for better caching)
COPY deno.json deno.lock ./

# Copy source code
COPY src/ ./src/

# Cache dependencies by running a type check (with import permissions)
RUN deno cache --lock=deno.lock --allow-import src/bot.ts

# Set non-root user for security
USER deno

# Expose port (optional, for health checks if implemented)
EXPOSE 8080

# Run the bot (with all necessary permissions)
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-import", "src/bot.ts"]
