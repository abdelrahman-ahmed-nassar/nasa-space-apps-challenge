// This main function will run when the document is fully loaded
async function loadAndDisplayData() {
    try {
        const response = await fetch('asteroids_data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const asteroidData = await response.json();

        updateKPIs(asteroidData);
        createCharts(asteroidData);

    } catch (error) {
        console.error("Could not load asteroid data:", error);
        document.body.innerHTML = `<h1 style="color: red; text-align: center;">Failed to load data. Please check the console for errors.</h1>`;
    }
}

function updateKPIs(asteroidData) {
    const hazardousAsteroids = asteroidData.filter(a => a.is_potentially_hazardous_asteroid === 1);
    document.getElementById('total-hazards').textContent = hazardousAsteroids.length.toLocaleString();

    const sortedByDate = [...hazardousAsteroids].sort((a, b) => new Date(a.close_approach_date) - new Date(b.close_approach_date));
    const nextThreat = sortedByDate[0];
    document.getElementById('next-threat-name').textContent = nextThreat.name;
    document.getElementById('next-threat-date').textContent = `Approach: ${nextThreat.close_approach_date.split('T')[0]}`;

    const sortedByScore = [...asteroidData].sort((a, b) => b.hazard_score - a.hazard_score);
    const topThreat = sortedByScore[0];
    document.getElementById('top-threat-name').textContent = topThreat.name;
    document.getElementById('top-threat-score').textContent = `Hazard Score: ${topThreat.hazard_score.toFixed(2)}`;
}

function createCharts(asteroidData) {
    const hazardousAsteroids = asteroidData.filter(a => a.is_potentially_hazardous_asteroid === 1);
    const nonHazardousCount = asteroidData.length - hazardousAsteroids.length;

    // --- Chart Colors & Global Config ---
    const accentColor = '#00ff88';
    const textColor = '#ffffff';
    const gridColor = 'rgba(255, 255, 255, 0.2)';
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    
    // --- Chart 1: Classification (Donut Chart) ---
    new Chart(document.getElementById('classificationChart'), {
        type: 'doughnut',
        data: {
            labels: ['Potentially Hazardous', 'Non-Hazardous'],
            datasets: [{
                data: [hazardousAsteroids.length, nonHazardousCount],
                backgroundColor: [accentColor, 'rgba(255, 255, 255, 0.2)'],
                borderColor: '#000000',
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // --- Chart 2: Top Threats (Bar Chart) ---
    const top5Threats = [...hazardousAsteroids].sort((a, b) => b.hazard_score - a.hazard_score).slice(0, 5);
    new Chart(document.getElementById('topThreatsChart'), {
        type: 'bar',
        data: {
            labels: top5Threats.map(a => a.name),
            datasets: [{
                label: 'Hazard Score',
                data: top5Threats.map(a => a.hazard_score),
                backgroundColor: accentColor,
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // --- Chart 3: Timeline ---
    const upcomingThreats = [...hazardousAsteroids].sort((a, b) => new Date(a.close_approach_date) - new Date(b.close_approach_date)).slice(0, 5);
    new Chart(document.getElementById('timelineChart'), {
        type: 'line',
        data: {
            labels: upcomingThreats.map(a => a.close_approach_date.split('T')[0]),
            datasets: [{
                label: 'Hazard Score',
                data: upcomingThreats.map(a => a.hazard_score),
                borderColor: accentColor,
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // --- NEW Chart 4: Risk Matrix (Scatter Plot) ---
    const riskData = hazardousAsteroids.map(a => ({
        x: a.Short_Distance__from_Earth_Km / 1e6, // Distance in Million Km
        y: a.diameter_avg * 1000, // Diameter in Meters
        r: a.hazard_score * 2 // Radius of bubble based on hazard
    }));

    new Chart(document.getElementById('riskMatrixChart'), {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Hazardous Asteroids',
                data: riskData,
                backgroundColor: 'rgba(0, 255, 136, 0.5)',
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Closest Approach (Million Km)' } },
                y: { title: { display: true, text: 'Estimated Diameter (Meters)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- Run Everything ---
loadAndDisplayData();