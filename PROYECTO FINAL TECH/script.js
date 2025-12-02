// =============================
// GRÁFICO DE BARRAS - ENERGÍA
// =============================

// Datos de ejemplo (luego los reemplazamos con los del CSV)
const datosEnergia = {
    wind: 250,        // wind-generation
    solar: 180,       // solar-energy-consumption
    hydro: 400,       // hydropower-consumption
    biofuel: 90,      // biofuel-production
    geo: 20           // installed-geothermal-capacity
};

const ctxBarras = document.getElementById("graficaBarras").getContext("2d");

new Chart(ctxBarras, {
    type: "bar",
    data: {
        labels: [
            "Viento",
            "Solar",
            "Hidroeléctrica",
            "Biocombustible",
            "Geotérmica"
        ],
        datasets: [{
            label: "Producción de Energía (TWh)",
            data: [
                datosEnergia.wind,
                datosEnergia.solar,
                datosEnergia.hydro,
                datosEnergia.biofuel,
                datosEnergia.geo
            ],
            backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)"
            ],
            borderColor: "rgba(0,0,0,0.3)",
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "TWh (Teravatios hora)"
                }
            }
        }
    }
});
