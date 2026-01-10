# Docker Hardened Images (DHI) Technical Demonstration

## Overview

This repository demonstrates the security transition from a standard containerized Node.js application to a hardened deployment using Docker Hardened Images (DHI). The demonstration features a "Security Health Dashboard" that visualizes the posture improvements achieved through hardening.

## Technical Components

### Application Layer
- **Backend**: Node.js Express server providing system and security metadata.
- **Frontend**: Modern, responsive dashboard built with Vanilla CSS and JavaScript, designed for technical clarity and data visualization.

### Containerization Layer
- **Standard Deployment**: Utilizes the standard `node:20-alpine` image as a baseline.
- **Hardened Deployment**: Utilizes `dhi.io/node:20`, incorporating security-first configurations such as non-root execution and a minimal attack surface.

## Security Transition Benefits

The transition to Docker Hardened Images provides several critical security advantages:

1. **Reduced Attack Surface**: DHIs are intentionally minimal, containing only the essential libraries required for the runtime. This significantly reduces the number of potential targets for exploitation.
2. **Supply Chain Transparency**: Each DHI includes a signed Software Bill of Materials (SBOM) and provenance metadata, ensuring the integrity and origin of the image.
3. **Continuous Remediation**: These images are continuously scanned and updated to maintain a near-zero exploitable CVE (Common Vulnerabilities and Exposures) status.
4. **Secure-by-Default Configuration**: DHIs are pre-configured with security best practices, such as running applications as a non-root user and hardening OS kernel interfaces.

## Deployment Instructions

### Prerequisites
- Docker Engine installed.
- Access to the `dhi.io` registry.

### Building the Standard Image
```bash
docker build -t dhi-demo:standard -f Dockerfile .
```

### Building the Hardened Image
```bash
docker build -t dhi-demo:hardened -f Dockerfile.hardened .
```

### Running the Demonstration
To view the security dashboard for either version, run the corresponding image:

```bash
# Run Standard
docker run -p 3000:3000 dhi-demo:standard

# Run Hardened
docker run -p 3000:3000 dhi-demo:hardened
```

Access the dashboard at `http://localhost:3000`.

## Analysis and Comparison

The Security Health Dashboard provides **Live Environment Introspection**. It does not rely on hardcoded labels; instead, it actively probes its own container environment to prove the hardened status:

- **Permission Model**: Real-time verification of the execution UID (proves non-root status).
- **Vulnerability Context**: Correlates image minimalism with reduced exploitable surface.
- **Package Integrity**: Directly queries the package manager (or detects its absence) to confirm the minimal footprint.
- **Binary Discovery**: Scans for high-risk binaries like shells (`sh`) and package managers (`apk`) to showcase the reduced attack surface.

---
Technical documentation for secure container deployments.
