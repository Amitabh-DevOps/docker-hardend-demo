# Docker Hardened Image (DHI) vs Standard Demo

This demo application showcases the security benefits of migrating from standard base images to **Docker Hardened Images (DHI)**, following official best practices for supply chain security.

## Key Features of DHI Demonstrated
1.  **Minimalism**: Removal of shells (`sh`, `bash`) and package managers in the runtime.
2.  **Secure Defaults**: Automatic non-root user configuration and hardened system settings.
3.  **Governance**: Verifiable **SBOM** (Software Bill of Materials) and **Provenance** (SLSA Level 3).
4.  **CVE Reduction**: Continuous monitoring and patching for near-zero vulnerabilities.

## Project Structure
- `Dockerfile.standard`: Uses a multi-stage build with `node:24`. The final stage is intentionally "fat".
- `Dockerfile.hardened`: Follows the official DHI workflow with `dhi.io/node:24-dev` for building and `dhi.io/node:24` for runtime.
- `app.js`: Express app with security diagnostic endpoints.
- `public/`: Modern dashboard to visualize the comparisons.

## How to Run the Demo

### 1. Build the Images
Open your terminal in this directory and run:

```bash
# Build the Standard (Vulnerable) Image
docker build -f Dockerfile.standard -t dhi-demo:standard .

# Build the Hardened (DHI) Image using official buildx flags
docker buildx build -f Dockerfile.hardened -t dhi-demo:hardened \
  --sbom=1 --provenance=1 --load .
```

### 2. Inspect Security Metadata (DHI)
Unlike standard images, DHI allows you to inspect deep supply chain data:

```bash
# Inspect SBOM (Software Bill of Materials)
docker buildx imagetools inspect dhi-demo:hardened --format "{{json .SBOM.SPDX}}"

# Inspect Provenance (SLSA Level 3)
docker buildx imagetools inspect dhi-demo:hardened --format "{{json .Provenance.SLSA}}"
```

### 3. Run the Containers
```bash
# Run Standard
docker run -d -p 3001:3000 --name demo-standard dhi-demo:standard

# Run Hardened
docker run -d -p 3002:3000 --name demo-hardened dhi-demo:hardened
```

### 4. Explore the Dashboard
Navigate to:
- **Standard Image**: [http://localhost:3001](http://localhost:3001)
- **Hardened Image**: [http://localhost:3002](http://localhost:3002)

### 4. Comparison Exercises
- **Attack Surface Scan**: Click "Run Diagnostic Scan". Observe how `sh`, `bash`, and `apt` are "Present" in Standard but "Absent" in Hardened.
- **Command Execution**: Try running `whoami` or `ls`. In the DHI container, this will fail because there is no shell to interpret the command.
- **User Check**: Observe the "User" field in Environment Specs. Standard defaults to `root`, while DHI defaults to `node`.

## Verifying Supply Chain Security (DHI Specific)
DHI images come with built-in metadata. You can verify this using Docker Scout:

```bash
# View the SBOM (Software Bill of Materials)
docker scout sbom dhi-demo:hardened

# Check for Vulnerabilities
docker scout cve dhi-demo:hardened
```
