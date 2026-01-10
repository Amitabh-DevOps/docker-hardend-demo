# Video Script: Docker Hardened Images Comparison

## Scene 1: Introduction (0:00 - 0:30)
**Visual**: A screen displaying a high number of vulnerabilities found in a standard container scan.
**Audio**: "Most standard Docker images contain significant security vulnerabilities before application code is even added. This video demonstrates how Docker Hardened Images, or DHI, can transform your security posture into a production-ready state."

## Scene 2: The Initial State (0:30 - 1:30)
**Visual**: Displaying the standard Dockerfile.
**Audio**: "Consider a typical Node.js configuration using a standard base image. While functional, it often runs as the root user and includes unnecessary system tools that expand the attack surface, such as package managers and shells."
**Visual**: Running a vulnerability scan on the standard image.
**Audio**: "A security scan of this image reveals numerous high and critical vulnerabilities. This represents the baseline risk associated with standard base images."

## Scene 3: Introduction to Hardened Images (1:30 - 2:00)
**Visual**: The dhi.io website or technical documentation.
**Audio**: "Docker Hardened Images are minimal, secure foundation images curate by Docker. They are designed to be minimal and consistently patched to remain free of known vulnerabilities while adhering to CIS benchmarks."

## Scene 4: The Hardened State (2:00 - 3:00)
**Visual**: Displaying the hardened Dockerfile.
**Audio**: "By switching to a hardened base image, several security improvements are achieved. The process now runs under a restricted non-root user, and the image is stripped of all non-essential binaries and shells."
**Visual**: Running a vulnerability scan on the hardened image.
**Audio**: "The resulting scan shows zero critical vulnerabilities. This configuration provides a verified, secured foundation for production workloads."

## Scene 5: Conclusion (3:00 - 3:30)
**Visual**: A side-by-side comparison of the scan results and security features.
**Audio**: "The technical advantages are clear. Transitioning to Docker Hardened Images provides a secure-by-default environment that is both compliant and performant. Implementing DHI is a fundamental step for any organization prioritizing production security."

## Outro
**Visual**: Text displaying 'Docker Hardened Images: Security by Default'.
**Audio**: "For further details on securing your container supply chain, refer to the documentation provided in the project repository."
