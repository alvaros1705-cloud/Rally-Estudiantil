# Rally Estudiantil 2.0 – Juego Web Educativo

Sitio web interactivo tipo juego para el evento **Rally Estudiantil 2.0**, dirigido a estudiantes de 9°, 10° y 11° que visitan la Universidad Simón Bolívar. Pensado para proyectarse en pantalla grande (TV) durante el turno de cada equipo.

---

## Cómo ejecutar la página (abrir en el navegador)

1. **Doble clic en `index.html`** (o arrástralo al navegador).  
   La página funciona sin PHP ni base de datos. El equipo se guarda en el navegador (localStorage) y los resultados se muestran al terminar cada juego.

2. Si al abrir `index.html` las imágenes no cargan (por restricciones de archivo local), usa un servidor local:
   - Doble clic en **`ejecutar.bat`** (abre PHP en el puerto 8080) y entra a **http://localhost:8080/index.html**, o
   - Con Python: `python -m http.server 8080` y entra a **http://localhost:8080/index.html**

---

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, etc.)
- Opcional: PHP o Python para servir los archivos si abrir directamente falla por restricciones de archivo local

---

## Imágenes (banner y logos)

Colocar en la carpeta `assets/images/` las imágenes con estos nombres:

| Archivo            | Descripción                                      |
|--------------------|--------------------------------------------------|
| `banner-rally.png` | Banner oficial del Rally                         |
| `logo-sistemas.png`| Logo Ingeniería de Sistemas                      |
| `logo-datos-ia.png`| Logo Ingeniería de Datos e Inteligencia Artificial|
| `logo-mecanica.png`| Logo Ingeniería Mecánica                         |

Si no se colocan, la pantalla de bienvenida funciona igual pero sin esas imágenes.

---

## Estructura del proyecto

```
RALLY/
├── assets/
│   ├── css/
│   │   └── estilos.css        # Estilos futuristas (TV)
│   ├── js/
│   │   ├── datos.js           # Datos: memorama, quiz, pistas, reto
│   │   └── rally-html.js       # Lógica de juegos y temporizadores
│   └── images/                # Banner y logos (ver arriba)
├── index.html                 # Bienvenida + START
├── instrucciones.html         # Reglas del juego
├── registro.html              # Nombre del equipo
├── seleccion-juego.html       # Elegir: Memorama, Quiz, Pistas, Reto
├── seleccion-categoria.html   # Categoría (Memorama: matriz 4×3)
├── juego.html                 # Página unificada de juego (según tipo)
├── resultados.html            # Tiempo, calificación, “Continuar a otra estación”
├── ejecutar.bat               # Inicia servidor local (PHP) y abre el navegador
└── README.md                  # Este archivo
```

---

## Flujo del usuario

1. **Bienvenida** → Banner, logos, botón **START / INICIAR**
2. **Instrucciones** → Reglas (tiempo cuenta, trabajo en equipo)
3. **Registro** → Nombre del equipo (obligatorio)
4. **Selección de juego** → Memorama, Quiz, Pistas, Reto
5. **Selección de categoría** → En Memorama: matriz 4×3 de categorías; en el resto se inicia directo
6. **Juego** → Temporizador en cuenta regresiva; al terminar se calcula calificación (1.0–5.0)
7. **Resultados** → Tiempo, calificación, botón **“Continuar a otra estación”** (vuelve al inicio)

---

## Juegos incluidos

| Juego        | Descripción breve |
|-------------|-------------------|
| **Memorama**| Varias categorías, 12 parejas (24 cartas) por categoría, cartas numeradas 1–24. |
| **Quiz**    | Preguntas de opción múltiple (máx. 10), 3 min por pregunta, respuesta incorrecta = 0.0. |
| **Pistas**  | Acertijos; 5 min total, 10 acertijos; pista -40 %, saltar = 0.0. |
| **Reto**    | Retos de “ordenar” listas contra el tiempo. |

---

## Calificación y puntaje

- **Criterio:** menor tiempo = mejor calificación.
- **Escala:** 1.0 a 5.0 (decimal).
- Los puntajes se muestran en pantalla; el equipo se guarda en localStorage.

---

## Diseño

- Estilo **futurista / tecnológico / juvenil**.
- Paleta: azules, verdes, blancos; efectos tipo glow y transiciones.
- Optimizado para **pantalla grande (TV)**.

---

## Licencia y uso

Proyecto educativo para el evento Rally Estudiantil 2.0. Ajustar contenido y branding según necesidades de la Universidad Simón Bolívar.
