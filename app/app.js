const express = require('express');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Endpoint to get environment details
app.get('/api/env', (req, res) => {
    res.json({
        os: os.type(),
        release: os.release(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        user: os.userInfo().username,
        uid: os.userInfo().uid,
        gid: os.userInfo().gid,
        uptime: os.uptime(),
        hostname: os.hostname(),
    });
});

// Endpoint to simulate an attack surface scan
// It tries to check if common binaries exist
app.get('/api/scan', (req, res) => {
    const tools = ['sh', 'bash', 'ls', 'curl', 'apt', 'sudo', 'npm', 'node'];
    const results = {};

    let completed = 0;
    tools.forEach(tool => {
        exec(`which ${tool}`, (error, stdout, stderr) => {
            results[tool] = !error;
            completed++;
            if (completed === tools.length) {
                res.json(results);
            }
        });
    });
});

// Endpoint to test privilege escalation (writing to root dir)
app.get('/api/test-privilege', (req, res) => {
    const filePath = '/root/dhi_breach_test.txt';
    const content = `Breach attempt at ${new Date().toISOString()}`;
    
    // Attempting to write to a restricted directory
    exec(`echo "${content}" > ${filePath}`, (error, stdout, stderr) => {
        if (error) {
            res.json({
                success: false,
                message: 'Access Denied: Cannot write to /root',
                error: error.message
            });
        } else {
            res.json({
                success: true,
                message: 'VULNERABILITY CONFIRMED: Successfully wrote to /root',
                filePath: filePath
            });
        }
    });
});

// Endpoint to simulate a more aggressive command execution
app.post('/api/exec', (req, res) => {
    const command = req.body.command;
    if (!command) return res.status(400).json({ error: 'No command provided' });

    exec(command, (error, stdout, stderr) => {
        res.json({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            error: error ? error.message : null
        });
    });
});

app.listen(port, () => {
    console.log(`DHI Demo App listening at http://localhost:${port}`);
});
