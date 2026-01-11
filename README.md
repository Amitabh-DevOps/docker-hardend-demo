# Docker Hardened Image (DHI) vs Standard Demo

This project provides a hands-on comparison between **Standard Docker Images** and **Docker Hardened Images (DHI)**. It demonstrates the shift from "convenience" to "security-by-default".

---

## AWS EC2 Ubuntu: Complete Setup & Demo Guide

Follow these steps to set up your environment and run the demo on a fresh AWS EC2 Ubuntu instance.

### 1. Install Docker (Official Method - Recommended)
While you *can* use `sudo apt install docker.io`, it is highly recommended to use the **Official Docker Repository** (shown below). This ensures you get the latest security patches and the `buildx` plugin required for the advanced DHI features (SBOM/Provenance).

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

# Install Docker and Buildx:
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker and enable it:
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (to run without sudo):
# NOTE: Log out and log back in for this change to take effect!
sudo usermod -aG docker $USER && newgrp docker

# 2. Install Docker Scout (Optional but Recommended)
# Docker Scout is used to verify SBOMs and Provenance from DHI.
curl -fsSL https://raw.githubusercontent.com/docker/scout-cli/main/install.sh -o install-scout.sh
sh install-scout.sh
```

### 3. Authenticate with DHI Registry

You will need your DHI credentials to pull the hardened images from the official registry.

```bash
docker login dhi.io
```

Enter your docker hub credentials when prompted.

### 4. Prepare the Demo

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

### 5. Build & Run the Demo

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

## Supply Chain Security and Transparency (DHI)

Docker Hardened Images (DHI) move beyond standard images by including built-in, cryptographically signed Software Bills of Materials (SBOMs). This ensures a transparent, tamper-proof inventory of every component in your image.

### 1. The Value of Signed SBOMs
- **Full Transparency**: Every DHI includes a complete list of libraries and dependencies, including versions and licenses.
- **Tamper-Proof Verification**: SBOMs are signed, allowing you to prove the image's authenticity and integrity.
- **Vulnerability Management**: A detailed inventory allows for precise identification of CVEs using tools like Docker Scout.
- **Compliance Ready**: Built-in support for SLSA Level 3 provenance and VEX helps meet strict regulatory standards.

### 2. Hands-on: Working with DHI metadata

To see these features in action, we first need to use a builder that supports these "attestations".

#### Initialize Advanced Builder
```bash
docker buildx create --name secure-builder --use
docker buildx inspect --bootstrap
```

#### Generate a Local SBOM
Unlike standard images, we can generate a verifiable inventory during the build process:
```bash
# Build with SBOM generation
docker buildx build -f Dockerfile.hardened -t dhi-demo:hardened --sbom=1 --output type=local,dest=./security-assets .

# Inspect the raw SBOM file
cat ./security-assets/sbom.spdx.json
```

#### Verify Authenticity via Docker Scout
For official DHI images, you can verify the signed inventory directly from the registry:

```bash
# View the live SBOM
docker scout sbom dhi.io/node:24

# Login with Docker Hub credentials
docker login

# Verify the cryptographic signature (Integrity check)
docker scout attest get dhi.io/node:24 \
  --predicate-type https://scout.docker.com/sbom/v0.1 \
  --verify
```

#### Quick Proof of Authenticity (Concise Output)
If you want to show someone that the image is official without showing the long JSON output, you can filter for the verification status:

```bash
docker scout attest get dhi.io/node:24 --predicate-type https://scout.docker.com/sbom/v0.1 --verify 2>&1 | grep -i "verified"
```
This will return a clean, one-line confirmation that the cryptographic signature is valid and official.

### 3. CVE Vulnerability Comparison

One of the most powerful features of DHI is its near-zero CVE status. You can compare the vulnerability profiles of the two images directly:

#### Scan the Standard Image
This will typically show dozens or hundreds of vulnerabilities from the full OS base.
```bash
docker scout cves dhi-demo:standard
```

#### Scan the Hardened (DHI) Image
This will show the "Near-Zero CVE" status of the hardened base.
```bash
docker scout cves dhi-demo:hardened
```

> [!NOTE]
> **Interpreting Results: Near-Zero vs. Zero CVE**
> You may still see a few **"Low"** severity vulnerabilities (such as `CVE-2010-0928`). These are often legacy or hardware-specific issues (e.g., targeting niche FPGA chips) that cannot be exploited in cloud environments. DHI prioritizes eliminating **Critical, High, and Medium** vulnerabilities that represent actionable risks.

### Exercise 3: Security Recommendations

Finally, see what Docker thinks you should do to fix each image:

```bash
# Check standard image (Prepare for a long list of suggestions!)
docker scout recommendations dhi-demo:standard

# Check hardened image
docker scout recommendations dhi-demo:hardened
```

- **Standard**: Scout will recommend switching to "slim" variants, updating packages, and removing hundreds of MBs of bloat.
- **Hardened**: Scout will return `image has no base image` or zero recommendations. This is a **win**—it means the image is so minimal and optimized that there is nothing left to "fix" or "strip away".

### Exercise 4: Privilege Escalation (Filesystem Lockdown)

In the dashboard, navigate to the **"File System Lockdown"** section.

1.  Click **"Try Privilege Escalation"** on the **Standard** image dashboard.
    *   **Result**: ⚠️ **VULNERABILITY CONFIRMED**. You will likely see a success message because the standard image runs as `root`.
2.  Click **"Try Privilege Escalation"** on the **Hardened** image dashboard.
    *   **Result**: 🛡️ **SECURE**. The operation is denied because DHI runs as a non-root user (`node`) by default.

### Exercise 5: Security Health Score

Observe the **"Security Health Score"** gauge at the top of both dashboards.

- **Standard Image**: Starts at **0%**. Even after running scans, it stays low because of the `root` user and open attack surface.
- **Hardened Image**: Starts at a baseline of **25%** (Non-root bonus). As you run the Diagnostic Scan and the Privilege Test, the score will climb toward **100%** as the dashboard verifies the lack of binaries and the locked filesystem.

---

## Automated Security (GitHub Actions)

This project includes a `.github/workflows/verify.yml` file that demonstrates how to implement **"Hard Gates"** in your CI/CD pipeline. It automatically:
1.  **Verifies DHI Signatures**: Ensures the base image hasn't been tampered with.
2.  **Enforces Quality**: Fails the build if **High** or **Critical** vulnerabilities are detected.

---

## Cleanup
```bash
docker stop demo-standard demo-hardened
docker rm demo-standard demo-hardened
```
