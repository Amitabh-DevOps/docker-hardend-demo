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
sudo apt-get install -y ca-certificates curl gnupg lsb-release
```

### 2. Install Docker
Install the Docker engine on the instance:
```bash
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
# Allow current user to run docker commands without sudo
sudo usermod -aG docker $USER
# Note: Log out and log back in for group changes to take effect
```

### 3. Install Trivy
Trivy is used for vulnerability scanning. Install it using the following commands:
```bash
sudo apt-get install -y wget apt-transport-https gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/dabest/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/dabest/almalinux/9/ x86_64 main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
# Alternative official installation for Ubuntu/Debian:
wget -qO - https://aquasecurity.github.io/trivy-repo/dabest/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/dabest/ $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy
```

## Running the Demonstration

### 1. Standard Deployment
Build and execute the standard image to observe security warnings:
```bash
docker build -t app-standard -f Dockerfile.standard .
docker run -p 3000:3000 app-standard
```
Access the application at `http://[your-ec2-ip]:3000`.

### 2. Hardened Deployment
Authenticate with the DHI registry and execute the secured image:
```bash
# Log in with your Docker Hub credentials
docker login dhi.io
docker build -t app-hardened -f Dockerfile.hardened .
docker run -p 3000:3000 app-hardened
```
Access the application at `http://[your-ec2-ip]:3000`.

## Real-time Security Probes
The application performs active environment detection for the following:
- **Identity Verification**: Checks if the process is running as root (UID 0).
- **Surface Analysis**: Probes for the availability of /bin/sh or /bin/bash.
- **Binary Detection**: Scans for common tools such as curl, apt, or yum.

---
*Developed for educational purposes regarding container security and best practices.*
