// Load cities from CSV and populate dropdown
fetch("city_coordinates.csv")
  .then((res) => res.text())
  .then((data) => {
    const lines = data.trim().split("\n");
    const select = document.getElementById("citySelect");

    lines.slice(1).forEach((line) => {
      const [lat, lon, city, country] = line.split(",");
      const option = document.createElement("option");
      option.value = JSON.stringify({ lat, lon });
      option.textContent = `${city}, ${country}`;
      select.appendChild(option);
    });
  });

document.getElementById("getWeather").addEventListener("click", () => {
  const selected = document.getElementById("citySelect").value;
  const output = document.getElementById("forecast");
  const status = document.getElementById("statusMessage");

  if (!selected) {
    alert("Please select a city.");
    return;
  }

  const { lat, lon } = JSON.parse(selected);
  const url = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;

  output.innerHTML = ""; // Clear old forecast
  status.textContent = "⏳ Loading forecast...";

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      status.textContent = "✅ Forecast loaded successfully!";
      const series = data.dataseries.slice(0, 5);

      series.forEach((item, index) => {
        const iconName = getIconName(item);
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
          <h3>+${item.timepoint} hrs</h3>
          <img src="images/${iconName}.png" alt="${item.prec_type}" width="60" 
               title="Cloud: ${item.cloudcover}, Precip: ${item.prec_type}">
          <p><strong>Temp:</strong> ${item.temp2m}°C</p>
          <p><strong>Precip:</strong> ${item.prec_type}</p>
          <p><strong>Cloud Cover:</strong> ${item.cloudcover}</p>
        `;

        output.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("API error:", error);
      status.textContent = "⚠️ Failed to fetch forecast. Try again.";
    });
});

// Determine icon based on cloud cover and precipitation
function getIconName(item) {
  const precip = item.prec_type;
  const cloud = item.cloudcover;

  if (precip === "rain") return "lightrain";
  if (precip === "snow") return "snow";
  if (precip === "ts") return "tstorm";
  if (precip === "none") {
    if (cloud <= 3) return "clear";
    if (cloud <= 6) return "pcloudy";
    if (cloud <= 8) return "mcloudy";
    return "cloudy";
  }

  return "fog"; // fallback
}
