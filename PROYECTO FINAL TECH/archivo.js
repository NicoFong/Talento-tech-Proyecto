document.addEventListener('DOMContentLoaded', () => {
    // 1. OBTENER REFERENCIAS DEL HTML
    const select = document.getElementById('country-select');
    const chartImg = document.getElementById('python-chart-img');
    const cardHidro = document.getElementById('card-hidro');
    const cardEolica = document.getElementById('card-eolica');
    const cardSolar = document.getElementById('card-solar');
    const cardBiomasa = document.getElementById('card-biomasa');

    // Lista EXACTA de países/entidades
    const paises = ['Africa', 'Africa (BP)', 'Algeria', 'Argentina', 'Asia', 'Asia Pacific (BP)', 
                     'Australia', 'Austria', 'Azerbaijan', 'Bangladesh', 'Belarus', 'Belgium', 
                     'Brazil', 'Bulgaria', 'CIS (BP)', 'Canada', 'Central America (BP)', 'Chile', 
                     'China', 'Colombia', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 
                     'Eastern Africa (BP)', 'Ecuador', 'Egypt', 'Estonia', 'Europe', 'Europe (BP)', 
                     'European Union (27)', 'Finland', 'France', 'Germany', 'Greece', 
                     'High-income countries', 'Hong Kong', 'Hungary', 'Iceland', 'India', 
                     'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kazakhstan', 
                     'Kuwait', 'Latvia', 'Lithuania', 'Lower-middle-income countries', 
                     'Luxembourg', 'Malaysia', 'Mexico', 'Middle Africa (BP)', 'Middle East (BP)', 
                     'Morocco', 'Netherlands', 'New Zealand', 'Non-OECD (BP)', 'North America', 
                     'North America (BP)', 'North Macedonia', 'Norway', 'OECD (BP)', 'Oceania', 
                     'Oman', 'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 
                     'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 
                     'South Africa', 'South America', 'South Korea', 
                     'South and Central America (BP)', 'Spain', 'Sri Lanka', 'Sweden', 
                     'Switzerland', 'Taiwan', 'Thailand', 'Trinidad and Tobago', 'Turkey', 
                     'Turkmenistan', 'USSR', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
                     'United States', 'Upper-middle-income countries', 'Uzbekistan', 'Venezuela', 
                     'Vietnam', 'Western Africa (BP)', 'World'];

    // Colores para los gráficos (Paleta Original/Por Defecto)
    const colors = {
        blue: 'rgba(54, 162, 235, 0.8)',
        yellow: 'rgba(255, 206, 86, 0.8)',
        green: 'rgba(75, 192, 192, 0.8)',
        red: 'rgba(255, 99, 132, 0.8)',
        purple: 'rgba(153, 102, 255, 0.8)'
    };

    // Almacenará las instancias de Chart
    let barChartInstance = null;
    let pieChartInstance = null;
    let lineChartInstance = null;
    let areaChartInstance = null;


    // --- FUNCIONES DE GRÁFICOS (Se mantienen intactas) ---

    function drawBarChart(productionData) {
        const ctx = document.getElementById('barChart').getContext('2d');
        if (barChartInstance) barChartInstance.destroy(); 
        
        barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Eólica', 'Solar', 'Hidro', 'Biomasa', 'Otras'],
                datasets: [{
                    label: 'Producción Total (TWh)',
                    data: productionData, 
                    backgroundColor: [colors.blue, colors.yellow, colors.green, colors.purple, colors.red],
                }]
            },
            options: { responsive: true, aspectRatio: 1.8, scales: { y: { beginAtZero: true } } }
        });
    }

    function drawPieChart(productionData) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        if (pieChartInstance) pieChartInstance.destroy();

        const total = productionData.reduce((a, b) => a + b, 0);
        const pieData = productionData.map(value => (value / total) * 100);

        pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Eólica', 'Solar', 'Hidro', 'Biomasa', 'Otras'],
                datasets: [{
                    label: 'Porcentaje (%)',
                    data: pieData,
                    backgroundColor: [colors.blue, colors.yellow, colors.green, colors.purple, colors.red],
                    hoverOffset: 4
                }]
            },
            options: { responsive: true, aspectRatio: 1 }
        });
    }

    function drawLineChart(years, windData, solarData) {
        const ctx = document.getElementById('lineChart').getContext('2d');
        if (lineChartInstance) lineChartInstance.destroy();

        lineChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Capacidad Eólica (GW)',
                    data: windData,
                    borderColor: colors.blue,
                    fill: false,
                    tension: 0.1
                }, {
                    label: 'Capacidad Solar (GW)',
                    data: solarData,
                    borderColor: colors.yellow,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: { responsive: true, aspectRatio: 1.8, scales: { y: { beginAtZero: true } } }
        });
    }

    function drawAreaChart(years, renewableData, conventionalData) {
        const ctx = document.getElementById('areaChart').getContext('2d');
        if (areaChartInstance) areaChartInstance.destroy();

        areaChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Consumo Renovable',
                    data: renewableData,
                    borderColor: colors.green,
                    backgroundColor: 'rgba(75, 192, 192, 0.4)',
                    fill: 'origin'
                }, {
                    label: 'Consumo Convencional',
                    data: conventionalData,
                    borderColor: colors.red,
                    backgroundColor: 'rgba(255, 99, 132, 0.4)',
                    fill: 'origin'
                }]
            },
            options: { responsive: true, aspectRatio: 1.8, scales: { y: { beginAtZero: true, stacked: false } } }
        });
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


    // Función de respaldo (Si el JSON falla)
    const fallbackData = {
        eolica: 450, solar: 200, hidro: 700, biomasa: 150, otras: 50,
        years: ['2018', '2019', '2020', '2021', '2022', '2023'],
        windTrend: [120, 150, 180, 220, 250, 280],
        solarTrend: [50, 65, 80, 100, 120, 140],
        renewableConsumption: [300, 350, 380, 420, 450, 480],
        conventionalConsumption: [850, 800, 750, 720, 700, 680]
    };


    function updateDashboard(paisSeleccionado, data) {
        if (!paisSeleccionado) return;

        // 1. Mostrar la imagen del gráfico PNG de Python
        const imageName = paisSeleccionado.replace(/\//g, '-').replace(/:/g, '-');
        chartImg.src = `graficas/${imageName}.png`;
        chartImg.alt = `Gráfico de energía para ${paisSeleccionado}`;
        
        // 2. DIBUJAR GRÁFICOS INTERACTIVOS CON DATOS REALES O DE PRUEBA
        const productionData = [
            Number(data.eolica), 
            Number(data.solar), 
            Number(data.hidro), 
            Number(data.biomasa), 
            Number(data.otras || 0)
        ];
        
        drawBarChart(productionData);
        drawPieChart(productionData);
        drawLineChart(data.years, data.windTrend, data.solarTrend);
        drawAreaChart(data.years, data.renewableConsumption, data.conventionalConsumption);

        // 3. ACTUALIZAR TARJETAS CON VALORES REALES
        cardHidro.textContent = `Hidro: ${Number(data.hidro).toFixed(2)} TWh`;
        cardEolica.textContent = `Eólica: ${Number(data.eolica).toFixed(2)} TWh`;
        cardSolar.textContent = `Solar: ${Number(data.solar).toFixed(2)} TWh`;
        cardBiomasa.textContent = `Biomasa: ${Number(data.biomasa).toFixed(2)} TWh`;
    }

    function loadDashboard() {
        let actualData = fallbackData; 
        
        // 1. Cargar el JSON generado por Node.js (datos reales)
        fetch('datos_formateados.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}. Usando datos de prueba.`);
                }
                return response.json(); 
            })
            .then(data => {
                console.log("Datos cargados exitosamente desde Node.js.");
                actualData = data; 
            })
            .catch(error => {
                console.error('Error al cargar datos reales. Usando datos de respaldo.', error);
            })
            .finally(() => {
                 // 4. Llenar el selector de país
                paises.forEach(pais => {
                    const option = document.createElement('option');
                    option.value = pais;
                    option.textContent = pais;
                    select.appendChild(option);
                });

                // 5. Establecer el valor predeterminado y el listener
                const defaultCountry = 'World';
                select.value = defaultCountry;
                updateDashboard(defaultCountry, actualData); 

                // ⭐️ Inicializa la calculadora con los datos cargados 
                initializeCalculator(actualData); 

                // El listener usa los datos que se cargaron/fallaron en el fetch
                select.addEventListener('change', (e) => {
                    updateDashboard(e.target.value, actualData);
                });
            });
    }

    loadDashboard();
});
