document.addEventListener("DOMContentLoaded", () => {
  // Global variables to hold data
  let allAsteroids = [];
  let charts = {}; // Object to hold our chart instances

  // DOM element references
  const resultsCountEl = document.getElementById("results-count");
  const tableBodyEl = document.getElementById("data-table-body");
  const applyFiltersBtn = document.getElementById("apply-filters-btn");

  // --- Main Initialization Function ---
  async function initialize() {
    try {
      const response = await fetch("/asteroids_data.json");
      if (!response.ok) throw new Error("Network response was not ok");
      allAsteroids = await response.json();

      // Initial display
      displayData(allAsteroids);
      applyFiltersBtn.addEventListener("click", () => {
        const filteredData = applyFilters();
        displayData(filteredData);
      });
    } catch (error) {
      console.error("Failed to load or process data:", error);
      resultsCountEl.textContent = "Error loading data";
    }
  }

  // --- Filtering Logic ---
  function applyFilters() {
    const hazardFilter = document.getElementById("hazard-filter").value;
    const minDiameter = parseFloat(
      document.getElementById("min-diameter").value
    );
    const maxDiameter = parseFloat(
      document.getElementById("max-diameter").value
    );
    const minVelocity = parseFloat(
      document.getElementById("min-velocity").value
    );
    const maxVelocity = parseFloat(
      document.getElementById("max-velocity").value
    );
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    return allAsteroids.filter((a) => {
      // Hazard Filter
      if (
        hazardFilter === "hazardous" &&
        a.is_potentially_hazardous_asteroid !== 1
      )
        return false;
      if (
        hazardFilter === "non-hazardous" &&
        a.is_potentially_hazardous_asteroid === 1
      )
        return false;

      // Numerical Filters
      if (!isNaN(minDiameter) && a.diameter_avg < minDiameter) return false;
      if (!isNaN(maxDiameter) && a.diameter_avg > maxDiameter) return false;
      if (!isNaN(minVelocity) && a["Velocity km/s"] < minVelocity) return false;
      if (!isNaN(maxVelocity) && a["Velocity km/s"] > maxVelocity) return false;

      // Date Filters
      if (startDate && a.close_approach_date < startDate) return false;
      if (endDate && a.close_approach_date > endDate) return false;

      return true;
    });
  }

  // --- Data Display Logic ---
  function displayData(data) {
    resultsCountEl.textContent = data.length.toLocaleString();
    updateTable(data);
    updateCharts(data);
  }

  function updateTable(data) {
    tableBodyEl.innerHTML = ""; // Clear existing table
    const dataToShow = data.slice(0, 200); // IMPORTANT: Only show top 200 results for performance

    dataToShow.forEach((a) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${a.name}</td>
                <td>${a.diameter_avg.toFixed(3)}</td>
                <td>${a["Velocity km/s"].toFixed(2)}</td>
                <td>${a.close_approach_date.split("T")[0]}</td>
                <td>${a.hazard_score.toFixed(2)}</td>
            `;
      tableBodyEl.appendChild(row);
    });
  }

  function updateCharts(data) {
    // Destroy existing charts before creating new ones
    if (charts.correlation) charts.correlation.destroy();
    if (charts.distribution) charts.distribution.destroy();

    const accentColor = "#00ff88";
    Chart.defaults.color = "#ffffff";
    Chart.defaults.borderColor = "rgba(255, 255, 255, 0.2)";

    // Chart 1: Correlation (Velocity vs. Diameter)
    const correlationData = data.map((a) => ({
      x: a.diameter_avg,
      y: a["Velocity km/s"],
    }));

    charts.correlation = new Chart(
      document.getElementById("correlation-chart"),
      {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Asteroids",
              data: correlationData,
              backgroundColor: "rgba(0, 255, 136, 0.5)",
            },
          ],
        },
        options: {
          scales: {
            x: { title: { display: true, text: "Diameter (km)" } },
            y: { title: { display: true, text: "Velocity (km/s)" } },
          },
        },
      }
    );

    // Chart 2: Distribution (Hazard Score)
    const scores = data.map((a) => a.hazard_score);
    const bins = [0, 2, 4, 6, 8, 10]; // Bins for hazard scores
    const distributionData = bins.map((bin, i) => {
      const nextBin = bins[i + 1] || Infinity;
      return scores.filter((score) => score >= bin && score < nextBin).length;
    });

    charts.distribution = new Chart(
      document.getElementById("distribution-chart"),
      {
        type: "bar",
        data: {
          labels: bins.map((bin, i) =>
            i < bins.length - 1 ? `${bin}-${bins[i + 1]}` : `${bin}+`
          ),
          datasets: [
            {
              label: "Number of Asteroids",
              data: distributionData,
              backgroundColor: accentColor,
            },
          ],
        },
      }
    );
  }

  // --- Start the application ---
  initialize();
});
