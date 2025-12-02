// =============================================
// 1) FUNCIÓN PARA CARGAR CSV
// =============================================
async function cargarCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    const filas = data.trim().split("\n");
    const encabezados = filas.shift().split(",");

    return filas.map(fila => {
        const valores = fila.split(",");
        const obj = {};
        encabezados.forEach((col, i) => {
            const clean = col.trim(); // limpiar espacios y \r
            obj[clean] = isNaN(valores[i]) ? valores[i] : Number(valores[i]);
        });
        return obj;
    });
}



// =============================================
// 2) DASHBOARD FINAL BASADO EN CSV
// =============================================
document.addEventListener('DOMContentLoaded', async () => {

    const select = document.getElementById('country-select');
    if (!select) return; // Si la página no tiene dashboard, no ejecutamos nada

    const chartImg = document.getElementById('python-chart-img');
    const cardHidro = document.getElementById('card-hidro');
    const cardEolica = document.getElementById('card-eolica');
    const cardSolar = document.getElementById('card-solar');
    const cardBiomasa = document.getElementById('card-biomasa');

    // Cargar CSV
    const registros = await cargarCSV("datos.csv");

    // Obtener lista de entidades únicas
    const paises = [...new Set(registros.map(r => r.Entity))].sort();

    // Colores de gráficos
    const colors = {
        blue: 'rgba(54, 162, 235, 0.8)',
        yellow: 'rgba(255, 206, 86, 0.8)',
        green: 'rgba(75, 192, 192, 0.8)',
        red: 'rgba(255, 99, 132, 0.8)',
        purple: 'rgba(153, 102, 255, 0.8)'
    };

    let barChart = null;
    let pieChart = null;
    let lineChart = null;
    let areaChart = null;



    // =============================================
    // FUNCIONES PARA GRÁFICOS
    // =============================================

    function drawBarChart(arr) {
        const ctx = document.getElementById("barChart").getContext("2d");
        if (barChart) barChart.destroy();

        barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Eólica", "Solar", "Hidro", "Biomasa", "Otras"],
                datasets: [{
                    label: "Producción (TWh)",
                    data: arr,
                    backgroundColor: [
                        colors.blue,
                        colors.yellow,
                        colors.green,
                        colors.purple,
                        colors.red
                    ]
                }]
            },
            options: { responsive: true }
        });
    }

    function drawPieChart(arr) {
        const ctx = document.getElementById("pieChart").getContext("2d");
        if (pieChart) pieChart.destroy();

        const total = arr.reduce((a, b) => a + b, 0);
        const pct = arr.map(v => (v / total) * 100);

        pieChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Eólica", "Solar", "Hidro", "Biomasa", "Otras"],
                datasets: [{
                    data: pct,
                    backgroundColor: [
                        colors.blue,
                        colors.yellow,
                        colors.green,
                        colors.purple,
                        colors.red
                    ]
                }]
            }
        });
    }

    function drawLineChart(years, viento, solar) {
        const ctx = document.getElementById("lineChart").getContext("2d");
        if (lineChart) lineChart.destroy();

        lineChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: years,
                datasets: [
                    {
                        label: "Eólica (TWh)",
                        data: viento,
                        borderColor: colors.blue,
                        fill: false
                    },
                    {
                        label: "Solar (TWh)",
                        data: solar,
                        borderColor: colors.yellow,
                        fill: false
                    }
                ]
            }
        });
    }

    function drawAreaChart(years, renovable, convencional) {
        const ctx = document.getElementById("areaChart").getContext("2d");
        if (areaChart) areaChart.destroy();

        areaChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: years,
                datasets: [
                    {
                        label: "Renovable (suma eólica+solar+hidro+biomasa)",
                        data: renovable,
                        borderColor: colors.green,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        fill: true
                    },
                    {
                        label: "Convencional (estimado)",
                        data: convencional,
                        borderColor: colors.red,
                        backgroundColor: "rgba(255,99,132,0.4)",
                        fill: true
                    }
                ]
            }
        });
    }



    // ============================================================
    // FUNCIÓN PRINCIPAL PARA ARMAR LOS DATOS DE UN PAÍS
    // ============================================================
    function obtenerDatosPais(entity) {

        const filasPais = registros.filter(r => r.Entity === entity);

        // Ordenar por año
        filasPais.sort((a, b) => a.Year - b.Year);

        const years = filasPais.map(r => r.Year);
        const eolicaArr = filasPais.map(r => r["Wind Generation - TWh"]);
        const solarArr  = filasPais.map(r => r["Solar Generation - TWh"]);
        const hidroArr  = filasPais.map(r => r["Hydro Generation - TWh"]);
        const biomasaArr = filasPais.map(r => r["Geo Biomass Other - TWh"]);

        // Último año disponible
        const last = filasPais[filasPais.length - 1];

        const totalesActuales = {
            eolica: last["Wind Generation - TWh"],
            solar: last["Solar Generation - TWh"],
            hidro: last["Hydro Generation - TWh"],
            biomasa: last["Geo Biomass Other - TWh"],
            otras: 0
        };

        // Para el área chart sumamos fuentes renovables
        const renovable = filasPais.map(r =>
            r["Wind Generation - TWh"] +
            r["Solar Generation - TWh"] +
            r["Hydro Generation - TWh"] +
            r["Geo Biomass Other - TWh"]
        );

        // Estimamos convencional como constante 1000 - renovable (puedes cambiarlo)
        const convencional = renovable.map(r => Math.max(1000 - r, 20));

        return {
            years,
            eolicaArr,
            solarArr,
            hidroArr,
            biomasaArr,
            renovable,
            convencional,
            totalesActuales
        };
    }



    // ============================================================
    // FUNCIÓN PARA ACTUALIZAR EL DASHBOARD
    // ============================================================
    function updateDashboard(pais) {
        const d = obtenerDatosPais(pais);

        // Imagen PNG (si existe)
        if (chartImg) {
            const safe = pais.replace(/\//g, '-').replace(/:/g, '-');
            chartImg.src = `graficas/${safe}.png`;
            chartImg.alt = `Gráfico PNG de ${pais}`;
        }

        // Datos para gráficas de barras y pastel
        const arrBarras = [
            d.totalesActuales.eolica,
            d.totalesActuales.solar,
            d.totalesActuales.hidro,
            d.totalesActuales.biomasa,
            0
        ];

        drawBarChart(arrBarras);
        drawPieChart(arrBarras);

        drawLineChart(d.years, d.eolicaArr, d.solarArr);
        drawAreaChart(d.years, d.renovable, d.convencional);

        // Tarjetas
        if (cardHidro) cardHidro.textContent = `Hidro: ${d.totalesActuales.hidro} TWh`;
        if (cardEolica) cardEolica.textContent = `Eólica: ${d.totalesActuales.eolica} TWh`;
        if (cardSolar) cardSolar.textContent = `Solar: ${d.totalesActuales.solar} TWh`;
        if (cardBiomasa) cardBiomasa.textContent = `Biomasa: ${d.totalesActuales.biomasa} TWh`;

        // Inicializar calculadora
        initializeCalculator(d.totalesActuales);
    }



    // ============================================================
    // CALCULADORA
    // ============================================================
    function initializeCalculator(data) {
        const monto = document.getElementById("inversion-monto");
        const fuente = document.getElementById("select-fuente");
        const btn = document.getElementById("calcular-btn");
        const outGen = document.getElementById("potencial-generacion");
        const outPar = document.getElementById("participacion-estimada");

        if (!monto) return;

        const COSTO = {
            eolica: 150000000,
            solar: 200000000,
            hidro: 100000000,
            biomasa: 120000000
        };

        function calcular() {
            const m = Number(monto.value);
            const f = fuente.value;
            if (!m || m <= 0) return alert("Monto inválido");

            const gen = m / COSTO[f];

            const totalActual = data.eolica + data.solar + data.hidro + data.biomasa;
            const part = gen / (totalActual + gen) * 100;

            outGen.textContent = gen.toFixed(4) + " TWh";
            outPar.textContent = part.toFixed(2) + "%";
        }

        btn.addEventListener("click", calcular);
        calcular();
    }



    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    paises.forEach(p => {
        const option = document.createElement("option");
        option.value = p;
        option.textContent = p;
        select.appendChild(option);
    });

    select.value = "Colombia"; // país por defecto
    updateDashboard("Colombia");

    select.addEventListener("change", e => {
        updateDashboard(e.target.value);
    });
});
