import pandas as pd
import matplotlib.pyplot as plt
import os

# --- 1. Cargar archivo ---
# Nombre exacto de tu archivo XLSX
file_path = "Dato_Sucio.cvs.xlsx" 

# Usamos pd.read_excel para leer el archivo .xlsx
try:
    df = pd.read_excel(file_path)
except Exception as e:
    print(f"Error al cargar el archivo: {e}. Asegúrate que el archivo esté en la carpeta del proyecto y sea un archivo XLSX.")
    exit()

print("Archivo cargado correctamente.")
print("Columnas encontradas:", df.columns.tolist())

# --- 2. Renombrar columnas a nombres más fáciles ---
df = df.rename(columns={
    "Geo Biomass Other - TWh": "biomasa",
    "Solar Generation - TWh": "solar",
    "Wind Generation - TWh": "viento",
    "Hydro Generation - TWh": "hidro"
})

# --- 3. Conversión de datos (Soluciona los errores de fechas y texto) ---
# 3.1. Convertir 'Year' a números
df['Year'] = pd.to_numeric(df['Year'], errors='coerce').astype('Int64')

# 3.2. Convertir columnas de energía a números (Soluciona el TypeError)
columnas_energia = ['biomasa', 'solar', 'viento', 'hidro']
for col in columnas_energia:
    # Fuerza a que cualquier cosa que no sea número sea NaN
    df[col] = pd.to_numeric(df[col], errors='coerce') 

# Elimina las filas donde los datos clave son NaN (Datos Limpios)
df = df.dropna(subset=['Year'] + columnas_energia) 
print("Columnas 'Year' y energía convertidas a número.")

# --- 4. Crear carpeta para guardar imágenes ---
carpeta = "graficas"
if not os.path.exists(carpeta):
    os.makedirs(carpeta)
    print(f"Carpeta '{carpeta}' creada.")
else:
    print(f"Carpeta '{carpeta}' ya existe.")

# --- 5. Seleccionar países únicos ---
paises = df["Entity"].unique()
print("\nPaíses encontrados:", paises)

# --- 6. Graficar y guardar por país ---
for pais in paises:
    data_pais = df[df["Entity"] == pais]

    # LÍNEA MODIFICADA: Reducir el tamaño de la figura para que no se vea tan grande en la web
    plt.figure(figsize=(9, 5)) 

    plt.plot(data_pais["Year"], data_pais["biomasa"], label="Biomasa")
    plt.plot(data_pais["Year"], data_pais["solar"], label="Solar")
    plt.plot(data_pais["Year"], data_pais["viento"], label="Viento")
    plt.plot(data_pais["Year"], data_pais["hidro"], label="Hidro")

    plt.title(f"Energía renovable en {pais}")
    plt.xlabel("Año")
    plt.ylabel("TWh")
    plt.legend()
    plt.grid(True)

    # --- Guardar imagen PNG ---
    nombre_archivo = f"{carpeta}/{pais.replace('/', '-').replace(':', '-')}.png"
    plt.savefig(nombre_archivo, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Gráfica guardada: {nombre_archivo}")

print("\nTodas las gráficas fueron generadas y guardadas correctamente.")
