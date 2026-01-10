const express = require('express');
const fs = require('fs');
const { execSync } = require('child_process');
const app = express();
const port = 3000;

// Security Probe: Who am I?
function getIdentity() {
    const uid = process.getuid ? process.getuid() : -1;
    if (uid === -1) {
        return { label: "Local Test (OS Restricted)", status: "success" };
    }
    return {
        isRoot: uid === 0,
        label: uid === 0 ? "ROOT (Unsafe)" : `User ID: ${uid} (Secure)`,
        status: uid === 0 ? "danger" : "success"
    };
}

// Security Probe: Is there a shell?
function getShellStatus() {
    try {
        execSync('which sh');
        return { label: "SHELL FOUND (Locker open)", status: "danger" };
    } catch (e) {
        return { label: "LOCKED (No Shell Access)", status: "success" };
    }
}

// Security Probe: How many packages?
function getPackageCount() {
    try {
        // This is a simplified proxy for the demo
        const output = execSync('dpkg -l | wc -l').toString().trim();
        const count = parseInt(output) - 5; // subtract header lines
        return { label: `${count} OS Packages`, status: count > 100 ? "danger" : "success" };
    } catch (e) {
        return { label: "Minimal (No pkg manager)", status: "success" };
    }
}

app.get('/', (req, res) => {
    const identity = getIdentity();
    const shell = getShellStatus();
    const packages = getPackageCount();
    const isHardened = identity.status === "success" && shell.status === "success";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Security Vault Demo</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background: #1e293b; padding: 2rem; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); width: 400px; text-align: center; }
            h1 { font-size: 1.5rem; margin-bottom: 1.5rem; color: #38bdf8; }
            .card { background: #334155; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; border-left: 5px solid transparent; text-align: left; }
            .danger { border-left-color: #ef4444; }
            .success { border-left-color: #22c55e; }
            .label { font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.2rem; }
            .value { font-weight: bold; font-size: 1.1rem; }
            .badge { display: inline-block; padding: 0.5rem 1rem; border-radius: 2rem; margin-top: 1rem; font-weight: bold; }
            .badge-hardened { background: #22c55e; color: #064e3b; }
            .badge-standard { background: #ef4444; color: #7f1d1d; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Security Vault Demo</h1>
            
            <div class="card ${identity.status}">
                <div class="label">Identity</div>
                <div class="value">${identity.label}</div>
            </div>

            <div class="card ${shell.status}">
                <div class="label">Access</div>
                <div class="value">${shell.label}</div>
            </div>

            <div class="card ${packages.status}">
                <div class="label">Footprint</div>
                <div class="value">${packages.label}</div>
            </div>

            <div class="badge ${isHardened ? 'badge-hardened' : 'badge-standard'}">
                STATUS: ${isHardened ? 'HARDENED VAULT' : 'STANDARD HOUSE'}
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
