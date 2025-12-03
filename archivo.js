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


function initializeSolarCalculator() {

    const consumoInput = document.getElementById("consumo-kwh");
    const precioInput = document.getElementById("precio-kwh");
    const coberturaInput = document.getElementById("porcentaje-cobertura");
    const calcularBtn = document.getElementById("calcular-solar-btn");

    const resultadoGeneracion = document.getElementById("resultado-generacion");
    const resultadoAhorroMensual = document.getElementById("resultado-ahorro-mensual");
    const resultadoAhorroAnual = document.getElementById("resultado-ahorro-anual");
    const resultadoCosto = document.getElementById("resultado-costo");

    // Costo estimado por kWp instalado en Colombia (PROMEDIO)
    const COSTO_POR_KWP = 2800000; // COP por kWp (2.8 millones)
    
    // Un sistema de 1 kWp genera aprox. 120 kWh/mes en Colombia
    const GENERACION_KWH_POR_KWP = 120;

    function calcularAhorroSolar() {

        const consumo = parseFloat(consumoInput.value);
        const precio = parseFloat(precioInput.value);
        const cobertura = parseFloat(coberturaInput.value);

        if(isNaN(consumo) || consumo <= 0){
            alert("Ingresa un consumo válido.");
            return;
        }
        if(isNaN(precio) || precio <= 0){
            alert("Ingresa un precio por kWh válido.");
            return;
        }
        if(isNaN(cobertura) || cobertura <= 0 || cobertura > 100){
            alert("Ingresa un porcentaje entre 1% y 100%.");
            return;
        }

        // Energía que se desea cubrir con paneles
        const energiaCubierta = (consumo * cobertura) / 100;

        // Ahorros
        const ahorroMensual = energiaCubierta * precio;
        const ahorroAnual = ahorroMensual * 12;

        // Sistema solar requerido
        const kWpRequeridos = energiaCubierta / GENERACION_KWH_POR_KWP;
        const costoSistema = kWpRequeridos * COSTO_POR_KWP;

        // Mostrar resultados
        resultadoGeneracion.innerHTML = `🔆 Energía a cubrir: <strong>${energiaCubierta.toFixed(1)} kWh/mes</strong>`;
        resultadoAhorroMensual.innerHTML = `💰 Ahorro mensual estimado: <strong>$${ahorroMensual.toLocaleString('es-CO')}</strong>`;
        resultadoAhorroAnual.innerHTML = `📆 Ahorro anual estimado: <strong>$${ahorroAnual.toLocaleString('es-CO')}</strong>`;
        resultadoCosto.innerHTML = `⚡ Sistema recomendado: <strong>${kWpRequeridos.toFixed(2)} kWp</strong> (costo aprox: <strong>$${costoSistema.toLocaleString('es-CO')}</strong>)`;
    }

    calcularBtn.addEventListener("click", calcularAhorroSolar); 
}

    // --- LÓGICA DE LA CALCULADORA (NUEVA FUNCIÓN) ---
    function initializeCalculator(data) {
        const montoInput = document.getElementById('inversion-monto');
        const fuenteSelect = document.getElementById('select-fuente');
        const calcularBtn = document.getElementById('calcular-btn');
        const potencialGeneracionP = document.getElementById('potencial-generacion');
        const participacionEstimadaP = document.getElementById('participacion-estimada');

        // VALORES DE COSTE PROMEDIO POR TWh GENERADO (EJEMPLOS FICTICIOS)
        // AJUSTA estos valores a los costes reales de tu industria.
        // Valores en USD por TWh generado.
        const COSTO_POR_TWH = {
            eolica: 150000000, 
            solar: 200000000,  
            hidro: 100000000,  
            biomasa: 120000000 
        };

        // Calcula el total de generación actual a partir de los datos cargados.
        const totalGeneracionActual = Number(data.eolica) + Number(data.solar) + Number(data.hidro) + Number(data.biomasa) + Number(data.otras || 0);

        function calcularPotencial() {
            const monto = parseFloat(montoInput.value);
            const fuente = fuenteSelect.value;
            
            if (isNaN(monto) || monto <= 0) {
                alert("Por favor, ingresa un monto de inversión válido.");
                return;
            }

            const costoUnitario = COSTO_POR_TWH[fuente];
            
            // 1. Potencial de Generación: (Monto Invertido / Costo por TWh)
            const potencialGeneracion = monto / costoUnitario; 
            
            // 2. Participación Estimada: 
            const nuevaParticipacion = (potencialGeneracion / (totalGeneracionActual + potencialGeneracion)) * 100;

            // Mostrar resultados
            potencialGeneracionP.innerHTML = `Potencial de Generación (TWh): **${potencialGeneracion.toFixed(4)}**`;
            participacionEstimadaP.innerHTML = `Participación Estimada en el Total (%): **${nuevaParticipacion.toFixed(2)}%**`;
        }

        calcularBtn.addEventListener('click', calcularPotencial);
        
        // Ejecutar el cálculo una vez al cargar para mostrar resultados iniciales
        calcularPotencial(); 
    }
    // --- FIN LÓGICA CALCULADORA ---