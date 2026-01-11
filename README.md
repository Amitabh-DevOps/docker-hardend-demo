# Docker Hardened Image (DHI) vs Standard Demo

This project provides a hands-on comparison between **Standard Docker Images** and **Docker Hardened Images (DHI)**. It demonstrates the shift from "convenience" to "security-by-default".

---

## AWS EC2 Ubuntu: Complete Setup & Demo Guide

Follow these steps to set up your environment and run the demo on a fresh AWS EC2 Ubuntu instance.

### 1. Install Docker (Official Method - Recommended)
While you *can* use `sudo apt install docker.io`, it is highly recommended to use the **Official Docker Repository** (shown below). This ensures you get the latest security patches and the `buildx` plugin required for the advanced DHI features (SBOM/Provenance).

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker and Buildx:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker and enable it:
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (to run without sudo):
sudo usermod -aG docker $USER
# NOTE: Log out and log back in for this change to take effect!
```

### 2. Prepare the Demo
Clone the repository and move into the project directory:

```bash
git clone https://github.com/Amitabh-DevOps/docker-hardend-demo.git
cd docker-hardend-demo
```

## Project Structure

- `app/`: Directory containing all application source code.
    - `app.js`: Express server with security diagnostic endpoints.
    - `package.json`: Application dependencies and scripts.
    - `public/`: Modern dashboard files.
- `Dockerfile.standard`: Uses a multi-stage build with `node:24`.
- `Dockerfile.hardened`: Follows the official DHI workflow with `dhi.io/node:24-dev` and `dhi.io/node:24`.

### 3. Build & Run the Demo

#### Build the Images
```bash
# Build the Standard Image
docker build -f Dockerfile.standard -t dhi-demo:standard .

# Build the Hardened (DHI) Image
docker build -f Dockerfile.hardened -t dhi-demo:hardened .
```

#### Run the Containers
```bash
# Start Standard Image on Port 3001
docker run -d -p 3001:3000 --name demo-standard dhi-demo:standard

# Start Hardened Image on Port 3002
docker run -d -p 3002:3000 --name demo-hardened dhi-demo:hardened
```

---

## The Comparison at a Glance

| Feature | Standard Image (`node:24`) | Docker Hardened Image (`dhi.io/node:24`) |
| :--- | :--- | :--- |
| **Attack Surface** | Full Debian OS (Heavy) | **Distroless / Minimal (Zero-bloat)** |
| **Default User** | `root` | **`node` (Non-root)** |
| **Shell Access** | Available (`sh`, `bash`) | **None (Immune to shell execution)** |
| **Package Manager**| Available (`apt`) | **None (Prevents unauthorized installs)** |
| **Supply Chain** | Opaque | **Verifiable SBOM & SLSA Level 3** |
| **CVE Status** | Variable / Unpatched | **Near-Zero / Continuously Patched** |

---

## Interactive Security Audit

Navigate to your EC2 instance's IP in your browser:
- **Standard Image**: `http://<EC2-IP>:3001`
- **Hardened Image**: `http://<EC2-IP>:3002`

*(Ensure your EC2 Security Group allows inbound traffic on ports 3001 and 3002)*

### Exercise 1: Attack Surface Scan
On both dashboards, click **"Run Diagnostic Scan"**.
- **Standard**: Shows tools like `sh`, `bash`, and `apt` are **PRESENT**.
- **Hardened**: Shows tools are **ABSENT**. The image is "Distroless".

### Exercise 2: Command Execution
Try running `ls` or `whoami` in the **Command Execution Diagnostic** box.
- **Standard**: Executes the command and returns output.
- **Hardened**: Fails entirely because `/bin/sh` does not exist.

---

## Supply Chain Transparency (DHI)

DHI images provide verifiable metadata that standard images lack.

### 1. Initialize Advanced Builder
```bash
docker buildx create --name secure-builder --use
docker buildx inspect --bootstrap
```

### 2. Generate and Inspect SBOM
```bash
# Build with SBOM generation
docker buildx build -f Dockerfile.hardened -t dhi-demo:hardened --sbom=1 --output type=local,dest=./security-assets .

# Inspect the SBOM file
cat ./security-assets/sbom.spdx.json
```

---

## Cleanup
```bash
docker stop demo-standard demo-hardened
docker rm demo-standard demo-hardened
```
