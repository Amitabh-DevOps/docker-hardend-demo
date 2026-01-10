document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/security-insights');
        const data = await response.json();

        updateDashboard(data);
    } catch (error) {
        console.error('Error fetching security insights:', error);
    }
});

function updateDashboard(data) {
    // Update Badge
    const badge = document.getElementById('image-badge');
    badge.textContent = data.imageType;
    badge.className = `badge ${data.metrics.vulnerabilities === 0 ? 'hardened' : 'standard'}`;

    // Update Metrics
    const vulnElement = document.getElementById('vulnerabilities');
    vulnElement.textContent = data.metrics.vulnerabilities;
    vulnElement.className = `metric-value ${data.metrics.vulnerabilities === 0 ? 'text-success' : 'text-danger'}`;

    const pkgElement = document.getElementById('package-count');
    pkgElement.textContent = data.metrics.packageCount;
    pkgElement.className = `metric-value ${data.metrics.packageCount < 100 ? 'text-success' : ''}`;

    const riskElement = document.getElementById('risk-level');
    riskElement.textContent = data.metrics.attackSurface;
    riskElement.className = `metric-value ${data.metrics.attackSurface === 'Minimal' ? 'text-success' : 'text-warning'}`;

    // Update Features
    const featureList = document.getElementById('security-features');
    featureList.innerHTML = '';
    data.securityFeatures.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featureList.appendChild(li);
    });

    // Update System Info
    document.getElementById('runtime-version').textContent = data.systemInfo.nodeVersion;
    document.getElementById('platform-info').textContent = `${data.systemInfo.platform} (${data.systemInfo.architecture})`;
    document.getElementById('uptime-info').textContent = `${data.systemInfo.uptime}s`;
}
