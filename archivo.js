/**************************************
 * 1. FUNCIÓN PARA CARGAR EL CSV
 **************************************/

async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();

    const filas = data.trim().split("\n");
    const encabezados = filas.shift().split(",");

    return filas.map(fila => {
        const valores = fila.split(",");
        const obj = {};

        encabezados.forEach((col, i) => {
            // Limpia espacios y saltos de línea
            let limpio = col.replace("\r", "").trim();
            let valor = valores[i]?.replace("\r", "").trim();

            obj[limpio] = isNaN(valor) ? valor : Number(valor);
        });

        return obj;
    });
}

/**************************************
 * 2. GRÁFICA DE AMÉRICA (BARRAS)
 **************************************/

function graficaAmerica(datos) {
    const canvas = document.getElementById("chartAmerica");
    if (!canvas) return; // si no existe en esta página, no dibuja nada

    const paisesAmerica = ["United States", "Canada", "Mexico", "Brazil", "Argentina"];

    const america2020 = datos
        .filter(d => paisesAmerica.includes(d.Entity))
        .filter(d => d.Year === 2020);

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: america2020.map(d => d.Entity),
            datasets: [
                {
                    label: "Solar (TWh)",
                    data: america2020.map(d => d["Solar Generation - TWh"]),
                    backgroundColor: "rgba(255,206,86,0.7)"
                },
                {
                    label: "Eólica (TWh)",
                    data: america2020.map(d => d["Wind Generation - TWh"]),
                    backgroundColor: "rgba(54,162,235,0.7)"
                },
                {
                    label: "Hidroeléctrica (TWh)",
                    data: america2020.map(d => d["Hydro Generation - TWh"]),
                    backgroundColor: "rgba(153,102,255,0.7)"
                },
                {
                    label: "Biomasa/Otras (TWh)",
                    data: america2020.map(d => d["Geo Biomass Other - TWh"]),
                    backgroundColor: "rgba(75,192,192,0.7)"
                }
            ]
        },
        options: {
            responsive: true
        }
    });
}

/**************************************
 * 3. GRÁFICA DE TORTA — COLOMBIA
 **************************************/

function graficaTortaColombia(datos) {
    const canvas = document.getElementById("chartTortaCO");
    if (!canvas) return;

    const col2020 = datos.find(d => d.Entity === "Colombia" && d.Year === 2020);
    if (!col2020) return;

    new Chart(canvas, {
        type: "pie",
        data: {
            labels: ["Solar", "Eólica", "Hidro", "Biomasa/Otras"],
            datasets: [{
                data: [
                    col2020["Solar Generation - TWh"],
                    col2020["Wind Generation - TWh"],
                    col2020["Hydro Generation - TWh"],
                    col2020["Geo Biomass Other - TWh"]
                ],
                backgroundColor: [
                    "rgba(255,206,86,0.7)",
                    "rgba(54,162,235,0.7)",
                    "rgba(153,102,255,0.7)",
                    "rgba(75,192,192,0.7)"
                ]
            }]
        }
    });
}

/**************************************
 * 4. GRÁFICA DE LÍNEAS — COLOMBIA
 **************************************/

function graficaLineasColombia(datos) {
    const canvas = document.getElementById("chartLineasCO");
    if (!canvas) return;

    const col = datos.filter(d => d.Entity === "Colombia");

    new Chart(canvas, {
        type: "line",
        data: {
            labels: col.map(d => d.Year),
            datasets: [
                {
                    label: "Solar (TWh)",
                    data: col.map(d => d["Solar Generation - TWh"]),
                    borderColor: "rgba(255,206,86)"
                },
                {
                    label: "Eólica (TWh)",
                    data: col.map(d => d["Wind Generation - TWh"]),
                    borderColor: "rgba(54,162,235)"
                },
                {
                    label: "Hidro (TWh)",
                    data: col.map(d => d["Hydro Generation - TWh"]),
                    borderColor: "rgba(153,102,255)"
                }
            ]
        }
    });
}

/**************************************
 * 5. CARGAR CSV Y DETECTAR QUÉ GRÁFICA DIBUJAR
 **************************************/

cargarCSV("./datos.csv").then(datos => {
    graficaAmerica(datos);        // si existe su canvas → la dibuja
    graficaTortaColombia(datos);  // si existe su canvas → la dibuja
    graficaLineasColombia(datos); // si existe su canvas → la dibuja
});
new Chart(document.getElementById("chartTortaCO"), {
    type: "pie",
    data: chartData,
    options: {
        responsive: false,   // 👈 ahora respeta width y height del canvas
        maintainAspectRatio: false
    }
});