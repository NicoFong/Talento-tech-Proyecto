import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Configuración: Estilo visual y filtros de análisis
sns.set_style("whitegrid")
PAISES_A_INCLUIR = ["Spain", "Portugal", "Germany", "United States"] # Países a graficar
AÑO_INICIO = 2010 # Año inicial para la visualización
NOMBRE_ARCHIVO_GRAFICO = 'grafico_energia.png' # Nombre del archivo de imagen de salida

# Nombre del archivo CSV
file_path = "Copia de 02_modern-renewable-energy-consumption.xlsx - Copia de 02_modern-renewable-en.csv"

# --- 1. Cargar y Limpiar Datos (¡AJUSTE CRÍTICO!) ---
try:
    # on_bad_lines='skip' ignora líneas con formato incorrecto, resolviendo el error de carga
    df = pd.read_csv(file_path, encoding='latin-1', on_bad_lines='skip', low_memory=False)
    
    if df.empty:
        print("\nERROR: El archivo CSV se cargó, pero no contiene filas válidas.")
        exit()
        
    print(f"Archivo cargado exitosamente. Total de filas válidas: {len(df)}")
except Exception as e:
    print(f"ERROR: No se pudo cargar el archivo CSV. Revisa el nombre o la estructura: {e}")
    exit()

# --- 2. Preparación de Datos ---

# 2.1 Renombrar y Estandarizar Columnas
column_mapping = {
    'Geo Biomass Other - TWh': 'Biomass_TWh',
    'Solar Generation - TWh': 'Solar_TWh',
    'Wind Generation - TWh': 'Wind_TWh',
    'Hydro Generation - TWh': 'Hydro_TWh'
}
df = df.rename(columns=column_mapping)
generation_columns = list(column_mapping.values())

# 2.2 Conversión de Tipos (Manejo de Valores No Numéricos)
# El código utiliza errors='coerce' y fillna(0) para convertir datos sucios (como fechas o texto) a 0.0
df['Year'] = pd.to_numeric(df['Year'], errors='coerce').fillna(0).astype(int)

for col in generation_columns:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)
    
# 2.3 Aplicar Filtros (Países y Años)
df_filtrado = df[
    (df['Entity'].isin(PAISES_A_INCLUIR)) & 
    (df['Year'] >= AÑO_INICIO) &
    (df['Year'] != 0) 
].copy()

if df_filtrado.empty:
    print("\nAVISO: No se encontraron datos para los países y año seleccionados. Revisa los filtros.")
    exit()

# 2.4 Reestructurar los datos para facilitar la graficación
df_long = pd.melt(
    df_filtrado,
    id_vars=['Entity', 'Year'],
    value_vars=generation_columns,
    var_name='Tipo_Energia',
    value_name='Generacion_TWh'
)

# Crear una columna combinada para el eje X (País - Año)
df_long['Pais_Año'] = df_long['Entity'] + ' (' + df_long['Year'].astype(str) + ')'


# --- 3. Generar las Gráficas de Barras ---

print(f"\nGenerando gráfica de barras para los países: {PAISES_A_INCLUIR} desde el año {AÑO_INICIO}...")

plt.figure(figsize=(16, 8))
sns.barplot(
    data=df_long,
    x='Pais_Año', 
    y='Generacion_TWh', 
    hue='Tipo_Energia', 
    palette='Spectral'
)

# Configuración de los títulos y etiquetas
plt.title(
    f'Generación de Energía Renovable (TWh) por País y Año (Desde {AÑO_INICIO})',
    fontsize=16, 
    fontweight='bold'
)
plt.xlabel('País y Año', fontsize=12)
plt.ylabel('Generación (TWh)', fontsize=12)
plt.xticks(rotation=45, ha='right') 
plt.legend(title='Indicador', bbox_to_anchor=(1.01, 1), loc='upper left')
plt.tight_layout()

# ➡️ LÍNEA CLAVE: Guarda el gráfico como imagen para la web
plt.savefig(NOMBRE_ARCHIVO_GRAFICO) 
plt.close()

print(f"\n✅ ¡Gráfico guardado exitosamente! El archivo '{NOMBRE_ARCHIVO}VC<
 