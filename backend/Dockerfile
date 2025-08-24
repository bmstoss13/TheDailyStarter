# Use the official Golang image to build your application
FROM golang:1.22-alpine AS builder

# Set the current working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go application
RUN go build -o /app/main .

# Use a minimal base image for the final stage
FROM alpine:latest

# Install ca-certificates to ensure SSL/TLS connections work
RUN apk add --no-cache ca-certificates

# Set the working directory
WORKDIR /app

# Copy the compiled application from the builder stage
COPY --from=builder /app/main .

# Expose the port your Go app listens on (Cloud Run defaults to 8080)
EXPOSE 8080

# Command to run the executable
CMD ["/app/main"]
