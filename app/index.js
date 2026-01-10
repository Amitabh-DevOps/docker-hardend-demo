const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const app = express();
const port = 3000;

// Real-time Hardening Detection (No longer hardcoded!)
function detectHardening() {
    const results = {
        isNonRoot: process.getuid() !== 0,
        hasNoShell: false,
        minimalBinaries: false
    };

    // Check for shell availability
    try {
        execSync('ls /bin/sh', { stdio: 'ignore' });
    } catch (e) {
        results.hasNoShell = true;
    }

    // Check for common attacker tools (curl, apt, etc)
    const riskyTools = ['/usr/bin/curl', '/usr/bin/apt', '/usr/bin/yum'];
    results.minimalBinaries = riskyTools.every(tool => !fs.existsSync(tool));

    return results;
}

const securityStatus = detectHardening();
const IS_HARDENED = securityStatus.isNonRoot && (securityStatus.hasNoShell || securityStatus.minimalBinaries);

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Hardened Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0a0b10;
            --accent: #3b82f6;
            --accent-glow: rgba(59, 130, 246, 0.5);
            --hardened: #10b981;
            --standard: #ef4444;
            --card-bg: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
            --text-main: #f8fafc;
            --text-dim: #94a3b8;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }

        .background-glow {
            position: absolute;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0a0b10 100%);
            z-index: -1;
        }

        .container {
            width: 90%;
            max-width: 800px;
            padding: 40px;
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            border-radius: 99px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 2rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid;
        }

        .status-hardened {
            background: rgba(16, 185, 129, 0.1);
            color: var(--hardened);
            border-color: rgba(16, 185, 129, 0.2);
        }

        .status-standard {
            background: rgba(239, 68, 68, 0.1);
            color: var(--standard);
            border-color: rgba(239, 68, 68, 0.2);
        }

        .pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse-animation 2s infinite;
        }

        @keyframes pulse-animation {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 currentColor; }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 3rem;
            text-align: left;
        }

        .feature-card {
            padding: 20px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            transition: transform 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.04);
        }

        .feature-icon { font-size: 1.5rem; margin-bottom: 12px; }
        .feature-title { font-weight: 600; margin-bottom: 4px; color: var(--text-main); }
        .feature-desc { font-size: 0.875rem; color: var(--text-dim); }

        .footer {
            margin-top: 3rem;
            font-size: 0.75rem;
            color: var(--text-dim);
            opacity: 0.6;
        }
    </style>
</head>
<body>
    <div class="background-glow"></div>
    <div class="container">
        <h1>Docker Hardened Demo</h1>
        
        <div class="status-badge ${IS_HARDENED ? 'status-hardened' : 'status-standard'}">
            <div class="pulse" style="background-color: currentColor;"></div>
            ${IS_HARDENED ? 'Hardened Deployment' : 'Standard Deployment (Vulnerable)'}
        </div>

        <p style="color: var(--text-dim); font-size: 1.1rem; line-height: 1.6;">
            This application is running inside a container optimized for production security. 
            By using Docker Hardened Images (DHI), we eliminate common vulnerabilities at the source.
        </p>

        <div class="features">
            <div class="feature-card" style="border-color: ${securityStatus.isNonRoot ? 'var(--hardened)' : 'var(--standard)'}">
                <div class="feature-icon">[Identity]</div>
                <div class="feature-title">Identity: ${securityStatus.isNonRoot ? 'Non-Root' : 'Root User'}</div>
                <div class="feature-desc">${securityStatus.isNonRoot ? 'Process is running with restricted privileges.' : 'CRITICAL: Process is running with full root access.'}</div>
            </div>
            <div class="feature-card" style="border-color: ${securityStatus.hasNoShell ? 'var(--hardened)' : 'var(--standard)'}">
                <div class="feature-icon">[Environment]</div>
                <div class="feature-title">Shell: ${securityStatus.hasNoShell ? 'Removed' : 'Available'}</div>
                <div class="feature-desc">${securityStatus.hasNoShell ? 'No /bin/sh found. Minimal attack surface.' : 'WARNING: Shell is available for potential exploits.'}</div>
            </div>
            <div class="feature-card" style="border-color: ${securityStatus.minimalBinaries ? 'var(--hardened)' : 'var(--standard)'}">
                <div class="feature-icon">[Security]</div>
                <div class="feature-title">Binaries: ${securityStatus.minimalBinaries ? 'Minimal' : 'Bloated'}</div>
                <div class="feature-desc">${securityStatus.minimalBinaries ? 'No risky tools (curl/apt) detected.' : 'DANGER: Attacker tools like curl/apt are present.'}</div>
            </div>
        </div>

        <div class="footer">
            Powered by Docker Hardened Images & dhi.io
        </div>
    </div>
</body>
</html>
  `);
});

app.listen(port, () => {
    console.log(`-----------------------------------------------`);
    console.log(`App listening at http://localhost:${port}`);
    console.log(`Hardening Status: ${IS_HARDENED ? 'ENABLED (DHI)' : 'DISABLED (Standard)'}`);
    console.log(`-----------------------------------------------`);
});
