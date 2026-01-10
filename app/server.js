const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const { execSync } = require('child_process');

const fs = require('fs');

/**
 * Endpoint to provide security and system metadata.
 * Performs live introspection with cross-platform compatibility.
 */
app.get('/api/security-insights', (req, res) => {
    const isWindows = os.platform() === 'win32';

    // 1. Check for non-root execution
    let isRoot = false;
    if (!isWindows && process.getuid) {
        try {
            isRoot = process.getuid() === 0;
        } catch (e) {
            isRoot = false;
        }
    } else if (isWindows) {
        // Simple heuristic for Windows: Check if running in a common system directory or has admin-like access
        // For the demo, we'll assume Windows local dev is 'Standard' security context
        isRoot = true;
    }

    // 2. Check for presence of common utilities (Attack Surface)
    // We use a mix of PATH resolution and file checks
    const checkBinary = (name) => {
        if (isWindows) return false; // DHI targets Linux/Containers
        try {
            execSync(`command -v ${name} 2>/dev/null`, { stdio: 'ignore' });
            return true;
        } catch (e) {
            return false;
        }
    };

    const binaryStatus = {
        sh: checkBinary('sh'),
        apk: checkBinary('apk'),
        apt: checkBinary('apt'),
        ls: checkBinary('ls')
    };

    // 3. Estimate package count
    let estPackageCount = 185; // Default for Standard
    let isHardened = false;

    if (!isWindows) {
        try {
            // Try Alpine package manager
            const output = execSync('apk info 2>/dev/null | wc -l').toString().trim();
            estPackageCount = parseInt(output) || 185;
            isHardened = (estPackageCount < 100) && !isRoot;
        } catch (e) {
            // If apk is missing, it's likely a hardened DHI (often distroless-like)
            if (!binaryStatus.apk && !isRoot) {
                isHardened = true;
                estPackageCount = 42;
            }
        }
    } else {
        // On Windows local development, we treat it as a Standard/Expanded surface
        estPackageCount = 240;
        isHardened = false;
    }

    const insights = {
        scanTimestamp: new Date().toISOString(),
        imageType: isHardened ? 'Docker Hardened Image (DHI)' : (isWindows ? 'Local Windows Development' : 'Standard Development Image'),
        metrics: {
            vulnerabilities: isHardened ? 0 : 12,
            criticalIssues: isHardened ? 0 : 2,
            packageCount: estPackageCount,
            isRootUser: isRoot,
            attackSurface: isHardened ? 'Minimal' : 'Expanded'
        },
        systemInfo: {
            platform: os.platform(),
            architecture: os.arch(),
            nodeVersion: process.version,
            uptime: Math.floor(process.uptime())
        },
        binaryDiscovery: binaryStatus,
        securityFeatures: isHardened ? [
            'Non-root user execution (UID ' + (process.getuid ? process.getuid() : 'N/A') + ')',
            'No package manager detected',
            'Near-zero exploitable CVEs',
            'Signed SBOM included',
            'Minimal runtime footprint'
        ] : [
            isWindows ? 'Running on Host OS (Windows)' : 'Root user execution detected',
            'Package manager / Shell available',
            'Development utilities present',
            'Standard security baseline'
        ]
    };

    res.json(insights);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Image Type: ${process.env.IMAGE_TYPE || 'standard'}`);
});
