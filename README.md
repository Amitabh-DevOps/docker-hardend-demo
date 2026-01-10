# Docker Hardened Images: The Secure Vault Demo

This project demonstrates the security benefits of Docker Hardened Images (DHI) using a simple "Before vs. After" story.

## The Story: Standard House vs. Secure Vault

1.  **Standard Image (Standard House)**: Even with a modern build style, it's like a house with all doors open. It uses a standard base image where anyone is an admin.
2.  **Hardened Image (Secure Vault)**: A high-security vault. No tools inside, restricted user, strictly minimal.
3.  **The "Kitchen" (Multi-Stage)**: Both demos use a "Kitchen" (Stage 1) to build, but only DHI protects the "Meal" in a secure vault.

---

## 1. The Standard Deployment (The House)

**What to Say**: *"Notice that our app is running as ROOT (the master user). If an attacker gets in, they have full control. Also, look at the Access—the door is wide open because the container includes a Shell."*

```bash
docker build -t app-standard -f Dockerfile.standard .
docker run -p 3000:3000 app-standard
```
*Access at http://localhost:3000*

---

## 2. The Hardened Deployment (The Vault)

**What to Say**: *"Now we've switched to a Hardened Image. The Identity is now a restricted user, not root. The Access is LOCKED because the image has no shell. Even if an attacker gets in, there are no tools for them to use."*

```bash
docker login dhi.io
docker build -t app-hardened -f Dockerfile.hardened .
docker run -p 3000:3000 app-hardened
```
*Access at http://localhost:3000*

---

## 3. The Final Proof: Package Count

**What to Say**: *"The final proof is the footprint. The standard image has over 400 OS packages (extra noise and risk). The hardened image has only 13. We've removed 97% of the attack surface."*

```bash
# Standard Footprint (Usually 400+)
trivy image app-standard | grep "pkg_num="

# Hardened Footprint (Usually ~13)
trivy image app-hardened | grep "pkg_num="
```

---
*Created for Amitabh-DevOps - Security by Design.*