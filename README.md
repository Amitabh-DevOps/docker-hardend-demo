# Docker Hardened Image (DHI) vs Standard Image Demo

This project provides a hands-on comparison between **Standard Docker Images** and **Docker Hardened Images (DHI)**. It demonstrates the fundamental shift from "convenience-first" to "security-by-default" in modern containerization.

---

## AWS Deployment: Setup & Configuration Guide

Follow these steps to set up your environment on a fresh **AWS EC2 Ubuntu** instance.

### 1. Install Docker Engine
It is highly recommended to use the official Docker repository to ensure you have the latest security patches and the `buildx` plugin required for SBOM/Provenance features.

```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update

# Install Docker packages:
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker:
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (requires re-login or newgrp):
sudo usermod -aG docker $USER && newgrp docker
```

### 2. Install Docker Scout
Docker Scout is essential for verifying image attestations (SBOMs and Provenance).

```bash
curl -fsSL https://raw.githubusercontent.com/docker/scout-cli/main/install.sh -o install-scout.sh
sh install-scout.sh
```

### 3. Registry Authentication
Authenticate with the DHI registry to pull official hardened images.

```bash
# Enter your Docker Hub credentials when prompted
docker login dhi.io
```

### 4. Project Initialization
Clone the repository and prepare the build environment.

```bash
git clone https://github.com/Amitabh-DevOps/docker-hardend-demo.git
cd docker-hardend-demo
```

---

## Build and Run Operations

### 1. Build the Demo Images
We generate two distinct images to highlight the differences in architecture and security.

```bash
# Standard Image (node:24 base)
docker build -f Dockerfile.standard -t dhi-demo:standard .

# Hardened Image (dhi.io/node:24 base)
docker build -f Dockerfile.hardened -t dhi-demo:hardened .
```

### 2. Launch Containers
Start both applications on different ports for side-by-side auditing.

```bash
# Port 3001: Standard (Vulnerable Profile)
docker run -d -p 3001:3000 --name demo-standard dhi-demo:standard

# Port 3002: Hardened (Secure Profile)
docker run -d -p 3002:3000 --name demo-hardened dhi-demo:hardened
```

---

## Security Comparison: Key Metrics

| Feature | Standard Image (`node:24`) | Docker Hardened Image (`dhi.io`) |
| :--- | :--- | :--- |
| **Attack Surface** | Full Debian OS (Heavy) | **Distroless / Minimal (Zero-bloat)** |
| **Default User** | `root` | **`node` (Non-root)** |
| **Shell Access** | Available (`sh`, `bash`) | **None (Shell-less environment)** |
| **Package Manager**| Available (`apt`) | **None (Immutability by design)** |
| **Transparency** | Opaque "Black Box" | **Signed SBOM & SLSA Level 3** |
| **CVE Profile** | Noise (Dozens/Hundreds) | **Near-Zero (Actionable Risk only)** |

---

## Interactive Security Audit

Navigate to your instance IP in your browser at ports `3001` and `3002`.

### Exercise 1: Attack Surface Analysis
Click **"Run Diagnostic Scan"** on both dashboards.
- **Standard**: Tools like `sh`, `bash`, and `apt` are reported as **PRESENT**.
- **Hardened**: These tools are **ABSENT**, proving the distroless nature of the image.

### Exercise 2: Code Execution Test
Attempt to run `ls` or `whoami` in the **Command Execution Diagnostic** box.
- **Standard**: Commands execute successfully with visible output.
- **Hardened**: Operation fails because the underlying shell is missing.

### Exercise 3: File System Lockdown
Test for privilege escalation via the **"File System Lockdown"** section.
- **Standard**: Writing to `/root` **succeeds** (Identity: Root).
- **Hardened**: Writing is **denied**, proving the effectiveness of the `node` user default.

### Exercise 4: Security Health Score
Observe the dynamic **Security Health Score** gauge.
- **Standard**: Stays at **Critical (0%)** due to high-risk configurations.
- **Hardened**: Climbs toward **100% (Hardened)** as diagnostic tests confirm the image's integrity and permissions.

---

## Supply Chain Transparency

DHI images include cryptographically signed **Metadata Attestations** (SBOMs and Provenance).

### 1. Initialize Advanced Builder
Required to generate or inspect in-toto attestations.

```bash
docker buildx create --name secure-builder --use
docker buildx inspect --bootstrap
```

### 2. Technical Metadata Verification
Use `docker scout` to verify the "Birth Certificate" of the hardened image.

```bash
# 1. View live SBOM directly from registry
docker scout sbom dhi.io/node:24

# 2. Login to Docker Hub context
docker login

# 3. Cryptographic Signature Verification
# Proves the image is official and untampered
docker scout attest get dhi.io/node:24 \
  --predicate-type https://scout.docker.com/sbom/v0.1 \
  --verify 2>&1 | grep -i "verified"
```

### 3. Vulnerability Context (CVEs)
Compare the actionable risk between the images.

```bash
# Scan the Standard Image (Expect high noise)
docker scout cves dhi-demo:standard

# Scan the Hardened Image (Targeting Near-Zero)
docker scout cves dhi-demo:hardened
```

> [!NOTE]
> **Interpreting Results: Near-Zero vs. Zero CVE**
> DHI prioritizes eliminating **Critical and High** vulnerabilities. You may see legacy "Low" CVEs (e.g., `CVE-2010-0928`) which are often hardware-specific and non-exploitable in cloud environments.

### 4. Hardening Recommendations
Compare what Docker suggests to fix each image.

```bash
# Check standard for bloated recommendations
docker scout recommendations dhi-demo:standard

# Check hardened (Result: "image has no base image")
docker scout recommendations dhi-demo:hardened
```
*A "Zero Recommendations" result from Scout is a definitive win—it proves the image is already at the peak of optimization.*

---

## Cleanup
To remove the demo containers and images:

```bash
docker stop demo-standard demo-hardened
docker rm demo-standard demo-hardened
```
