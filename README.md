# Docker Hardened Images Demonstration

This repository provides a technical demonstration of the security improvements achieved by utilizing Docker Hardened Images (DHI). It includes a Node.js application that performs real-time environment probing to detect security configurations and vulnerabilities.

## Overview

The demonstration compares two primary container states:
- **Standard Configuration**: Utilizes common base images, runs as the root user, and includes unnecessary system binaries.
- **Hardened Configuration**: Utilizes official DHI base images from dhi.io, runs as a restricted non-root user, and maintains a minimal attack surface.

## Project Structure

- `app/`: Source code for the security-aware demonstration interface.
- `Dockerfile.standard`: Configuration for a non-hardened environment.
- `Dockerfile.hardened`: Optimized multi-stage configuration for a secured, shell-less environment using dhi.io.

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
Authenticate with the DHI registry and execute the secured image:

```bash
# Log in with your Docker Hub credentials
docker login dhi.io

# Build the hardened image
docker build -t app-hardened -f Dockerfile.hardened .

# Run the container
docker run -p 3000:3000 app-hardened
```
Access the application at `http://[your-ec2-ip]:3000`.

## Vulnerability Scanning with Trivy

To technically verify the security improvements, use Trivy to scan both images and compare the results.

### 1. Scan the Standard Image
```bash
trivy image --scanners vuln --vex repo app-standard > standard_scan_results.txt
```
This scan will typically reveal a significant number of vulnerabilities inherited from the standard base image.

### 2. Scan the Hardened Image
```bash
trivy image --scanners vuln --vex repo app-hardened > hardened_scan_results.txt
```
The scan of the hardened image should result in zero or minimal high/critical vulnerabilities, demonstrating the effectiveness of utilizing DHI.

## Technical Deep Dive: Attack Surface Reduction

The hardened image (`dhi.io/node:25`) is designed with a **zero-trust** approach. This introduces specific technical differences highlighted in the demonstration:

### 1. Multi-Stage Build Strategy
Standard images include a shell and package managers, allowing `npm install` to run directly. Hardened images remove these tools to prevent attackers from downloading or executing malicious scripts. We use a **Multi-Stage Build** to install dependencies in a standard environment and copy them into the secure runtime.

### 2. Shell Removal
The production image does not contain `/bin/sh` or `/bin/bash`. This prevents "living off the land" attacks where an intruder uses built-in tools to move laterally through your network.