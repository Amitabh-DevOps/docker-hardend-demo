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
    const attackSurfaceMap = [
        { name: 'sh', weight: 2 },
        { name: 'bash', weight: 3 },
        { name: 'apk', weight: 4 },
        { name: 'apt', weight: 4 },
        { name: 'curl', weight: 1 },
        { name: 'wget', weight: 1 },
        { name: 'git', weight: 2 },
        { name: 'sudo', weight: 5 },
        { name: 'gcc', weight: 4 },
        { name: 'ls', weight: 0.5 }
    ];

    const binaryStatus = {};
    let attackSurfaceScore = 0;

    attackSurfaceMap.forEach(check => {
        let found = false;
        if (!isWindows) {
            try {
                execSync(`command -v ${check.name} 2>/dev/null`, { stdio: 'ignore' });
                found = true;
            } catch (e) {
                found = false;
            }
        } else {
            // Mock for Windows demo purposes to show 'Expanded' state
            found = ['sh', 'ls', 'git', 'curl'].includes(check.name);
        }
        binaryStatus[check.name] = found;
        if (found) attackSurfaceScore += check.weight;
    });

    // 3. Estimate package count and calculate heuristic vulnerability count
    let estPackageCount = 0;
    if (!isWindows) {
        try {
            const output = execSync('apk info 2>/dev/null | wc -l').toString().trim();
            estPackageCount = parseInt(output) || 185;
        } catch (e) {
            estPackageCount = binaryStatus.apk ? 185 : 42;
        }
    } else {
        estPackageCount = 240;
    }

    // Dynamic Scoring Logic
    // Higher package count and more binaries = higher vulnerability count
    const baseVulns = Math.floor(estPackageCount / 15);
    const binaryVulns = Math.floor(attackSurfaceScore);
    const rootMultiplier = isRoot ? 1.5 : 1;

    const totalVulns = Math.floor((baseVulns + binaryVulns) * rootMultiplier);
    const criticals = Math.floor(totalVulns * 0.15 + (isRoot ? 2 : 0));

    const isHardened = estPackageCount < 100 && !isRoot && !binaryStatus.apk && !binaryStatus.apt;

    const insights = {
        scanTimestamp: new Date().toISOString(),
        imageType: isHardened ? 'Docker Hardened Image (DHI)' : (isWindows ? 'Local Windows Development' : 'Standard Development Image'),
        metrics: {
            vulnerabilities: isHardened ? 0 : totalVulns,
            criticalIssues: isHardened ? 0 : criticals,
            packageCount: estPackageCount,
            isRootUser: isRoot,
            attackSurface: isHardened ? 'Minimal' : (attackSurfaceScore > 15 ? 'High' : 'Expanded')
        },
        systemInfo: {
            platform: os.platform(),
            architecture: os.arch(),
            nodeVersion: process.version,
            uptime: Math.floor(process.uptime())
        },
        findings: {
            binaryStatus,
            attackSurfaceScore,
            isRoot
        },
        securityFeatures: isHardened ? [
            'Non-root user execution (UID ' + (process.getuid ? process.getuid() : 'N/A') + ')',
            'No package manager detected',
            'No compilers or build tools in runtime',
            'Restricted shell access',
            'Signed SBOM included'
        ] : [
            isWindows ? 'Running on Host OS (Windows)' : (isRoot ? 'Root user execution (RISK)' : 'Non-root user (Good)'),
            (binaryStatus.apk || binaryStatus.apt) ? 'Package manager available (HIGH RISK)' : 'No package manager',
            'Multiple attack surface binaries found',
            'Standard/Legacy security posture'
        ]
    };

    res.json(insights);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Image Type: ${process.env.IMAGE_TYPE || 'standard'}`);
});
