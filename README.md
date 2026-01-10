# Docker Hardened Images Demonstration

This repository provides a technical demonstration of the security improvements achieved by utilizing Docker Hardened Images (DHI). It includes a Node.js application that performs real-time environment probing to detect security configurations and vulnerabilities.

## Overview

The demonstration compares two primary container states:
- **Standard Configuration**: Utilizes common base images, runs as the root user, and includes unnecessary system binaries.
- **Hardened Configuration**: Utilizes official DHI base images from dhi.io, runs as a restricted non-root user, and maintains a minimal attack surface.

## Project Structure

- `/app`: Source code for the security-aware demonstration interface.
- `Dockerfile.standard`: Configuration for a non-hardened environment.
- `Dockerfile.hardened`: Configuration for a secured environment using dhi.io.

## Environment Setup (EC2 Ubuntu)

Follow these steps to prepare an Ubuntu environment on AWS EC2 for the demonstration.

### 1. System Update and Prerequisites
Update the local package index and install necessary dependencies:
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Install Docker
Install the Docker engine on the instance:
```bash
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
# Allow current user to run docker commands without sudo
sudo usermod -aG docker $USER && newgrp docker
```

### 3. Install Trivy
Trivy is used for vulnerability scanning. Install it using the following commands:
```bash
sudo apt-get install wget gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

### 4. Socket API Key (Required for Advanced DHI)
The advanced `sfw-ent-dev` image variant uses the Socket Firewall to protect against malicious packages during installation. To use it, you must obtain a free API key:
1. Create a free account at [Socket.dev](https://socket.dev).
2. Navigate to your **Organization Settings** or **API Keys** section.
3. Generate a new API Key.
4. Keep this key ready for the build process.

## Running the Demonstration

### 1. Clone this repository
```bash
git clone https://github.com/Amitabh-DevOps/docker-hardend-demo.git
cd docker-hardend-demo
```

### 2. Standard Deployment
Build and execute the standard image to observe security warnings:
```bash
docker build -t app-standard -f Dockerfile.standard .
docker run -p 3000:3000 app-standard
```
Access the application at `http://[your-ec2-ip]:3000`.

### 3. Hardened Deployment
Authenticate with the DHI registry and execute the secured image. Note that this advanced image requires the `SOCKET_API_KEY` build argument.

```bash
# Log in with your Docker Hub credentials
docker login dhi.io

# Build with your Socket API Key
docker build -t app-hardened \
  --build-arg SOCKET_API_KEY=your_socket_api_key_here \
  -f Dockerfile.hardened .

# Run the container
docker run -p 3000:3000 app-hardened
```
Access the application at `http://[your-ec2-ip]:3000`.

## Vulnerability Scanning with Trivy

To technically verify the security improvements, use Trivy to scan both images and compare the results.

### 1. Scan the Standard Image
```bash
trivy image app-standard
```
This scan will typically reveal a significant number of vulnerabilities inherited from the standard base image.

### 2. Scan the Hardened Image
```bash
trivy image app-hardened
```
The scan of the hardened image should result in zero or minimal high/critical vulnerabilities, demonstrating the effectiveness of utilizing DHI.

## Real-time Security Probes
The application performs active environment detection for the following:
- **Identity Verification**: Checks if the process is running as root (UID 0).
- **Surface Analysis**: Probes for the availability of /bin/sh or /bin/bash.
- **Binary Detection**: Scans for common tools such as curl, apt, or yum.

---
*Developed for educational purposes regarding container security and best practices.*
