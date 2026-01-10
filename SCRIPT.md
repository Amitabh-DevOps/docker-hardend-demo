# Technical Video Script: Securing Applications with Docker Hardened Images

## Scene 1: Introduction
**Visual**: Host on camera or screen-share showing a standard Dockerfile.
**Audio**: "In modern DevOps, the security of our containers is only as strong as the base images we build upon. Today, we are exploring a critical transition: moving from standard images to Docker Hardened Images, or DHI."

## Scene 2: The Baseline (Before)
**Visual**: Screen-share of `Dockerfile` (Standard) and the dashboard showing high vulnerability counts.
**Audio**: "We start with a standard Node.js application containerized using a common Alpine base. While it works, a quick scan reveals a significant attack surface—unnecessary packages and several exploitable CVEs. In a production environment, this is a liability."

## Scene 3: The Hardening Process
**Visual**: Screen-share of `Dockerfile.hardened` side-by-side with the standard one.
**Audio**: "Now, we transition to a Docker Hardened Image from dhi.io. Notice the multi-stage build. We keep our build tools in a temporary stage and only copy the production ready code into the DHI runtime. We also explicitly specify a non-root user."

## Scene 4: The Comparison (After)
**Visual**: Screen-share of the Security Health Dashboard after switching to the hardened image.
**Audio**: "The difference is immediate. Notice that the dashboard has automatically detected our non-root status and the absence of a package manager. This isn't hardcoded; the application is actively probing its environment to verify the reduction in attack surface."

## Scene 5: Technical Details
**Visual**: Close-up of SBOM metadata or the 'Security Features' list on the dashboard.
**Audio**: "DHIs are not just about fewer packages; they are about verified supply chains. Every image is signed and comes with provenance metadata, ensuring that what runs in your production environment is exactly what you intended."

## Scene 6: Conclusion
**Visual**: Dashboard summary card showing 'Attack Surface: Minimal'.
**Audio**: "Moving to hardened deployments is a standardized way to improve your security posture without adding complexity to your workflow. If you are deploying to mission-critical environments, Docker Hardened Images are the professional choice."

## Scene 7: CTA
**Visual**: Links to DHI.io and the repository.
**Audio**: "Check out the documentation in the repository to start your security transition today. Thanks for watching."
