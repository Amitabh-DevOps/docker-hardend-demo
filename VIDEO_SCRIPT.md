# Video Script: From Standard House to Secure Vault

## Intro (0:00 - 0:30)
**Visual**: A high-contrast UI showing "ROOT" and "SHELL FOUND" in red.
**Audio**: "Most Docker containers are built like standard houses—totally functional, but with all the doors left open. Today, I'll show you how to transform this into a Secure Vault using Docker Hardened Images."

## The Problem (0:30 - 1:15)
**Visual**: Code view of Dockerfile.standard.
**Audio**: "Our standard image runs as ROOT. That means anyone who gets in has total control. Plus, it includes a shell, which is the exact tool an attacker needs to explore your network."

## The Solution (1:15 - 2:00)
**Visual**: Code view of Dockerfile.hardened.
**Audio**: "To fix this, we use a Multi-Stage Build. Think of it like a Kitchen. We prepare our app in a standard environment, but we only serve the 'Meal' in this Secure Vault. We don't leave the knives or the stove in the vault."

## The Result (2:00 - 2:45)
**Visual**: The UI switching to "NON-ROOT" and "LOCKED" in green.
**Audio**: "Now look at the Result. No root user, no shell, and the footprint has dropped from 413 packages to just 13. We've removed 97% of the risk without changing a single line of our application code."

## Conclusion (2:45 - 3:00)
**Visual**: A side-by-side of the two UIs.
**Audio**: "That is the power of Docker Hardened Images. Security by design. Secure by default."
