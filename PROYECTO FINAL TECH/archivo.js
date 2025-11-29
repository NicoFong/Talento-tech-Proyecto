// Importar módulos necesarios
const fs = require('fs');
const csv = require('csv-parser');

// 1. Definir el nombre del archivo de datos
const FILE_PATH = 'Copia de 02_modern-renewable-energy-consumption.xlsx - Copia de 02_modern-renewable-en.csv';

// Array para guardar los datos formateados
const formattedData = [];

// Columnas largas en el CSV que necesitamos mapear
const COL_BIOMASS = 'Geo Biomass Other - TWh';
const COL_SOLAR = 'Solar Generation - TWh';
const COL_WIND = 'Wind Generation - TWh';
const COL_HYDRO = 'Hydro Generation - TWh';

console.log(`Leyendo y procesando el archivo: ${FILE_PATH}...`);

// 2. Crear una secuencia de lectura de archivo (Read Stream)
// Se añade { encoding: 'latin1' } para corregir el UnicodeDecodeError
fs.createReadStream(FILE_PATH, { encoding: 'latin1' })
    .on('error', (err) => {
        console.error(`\n[ERROR DE LECTURA]: No se pudo abrir o leer el archivo. Error:`, err.message);
    })
    // 3. Pasar la secuencia al parser de CSV
    .pipe(csv())
    // 4. Procesar cada fila (registro)
    .on('data', (row) => {
        // Función para limpiar y convertir valores a número, usando 0 si no son válidos
        const getNumericValue = (key) => {
            const val = parseFloat(row[key]);
            return isNaN(val) ? 0 : val;
        };

        const biomassValue = getNumericValue(COL_BIOMASS);
        const solarValue = getNumericValue(COL_SOLAR);
        const windValue = getNumericValue(COL_WIND);
        const hydroValue = getNumericValue(COL_HYDRO);
        const yearValue = parseInt(row['Year']);
        
        // El formato solicitado requiere usar 'Code' para la etiqueta 'Geo'
        const geoValue = row['Code'] || 'N/A';
        const entityValue = row['Entity'] || 'N/A';
        
        // 5. Construir la cadena con el formato solicitado
        const formattedString = 
            `Entity: ${entityValue}, ` +
            `Code: ${row['Code'] || 'N/A'}, ` +
            `Year: ${yearValue}, ` +
            `Geo: ${geoValue}, ` + // Usamos Code para 'Geo'
            `Biomass: ${biomassValue.toFixed(2)}, ` +
            `Solar: ${solarValue.toFixed(2)}, ` +
            `Wind: ${windValue.toFixed(2)}, ` +
            `Hydro: ${hydroValue.toFixed(2)}`;

        formattedData.push(formattedString);
    })
    
    // 6. Finalizar: Esta es la sección que REEMPLAZAS
    .on('end', () => {
        console.log('\n--- Procesamiento Completado ---');
        console.log(`Total de registros procesados: ${formattedData.length}\n`);
        
        // --- CÓDIGO CLAVE AÑADIDO: GUARDAR EN ARCHIVO ---
        const outputContent = formattedData.join('\n');
        
        // fs.writeFile escribe la información en un nuevo archivo llamado 'datos_formateados.txt'
        fs.writeFile('datos_formateados.txt', outputContent, 'latin1', (err) => {
             if (err) {
                 console.error('ERROR al guardar el archivo:', err);
                 return;
             }
             console.log('✅ ¡DATOS GUARDADOS! El archivo "datos_formateados.txt" está listo para la web.');
             console.log('Ahora sigue con el paso 2 (Crear index.html) para verlo en el navegador.');
        });
        // --- FIN DEL CÓDIGO CLAVE ---
    });
