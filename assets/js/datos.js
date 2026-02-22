/**
 * Rally Estudiantil 2.0 - Datos para versión HTML (Memorama, Quiz, Pistas, Reto)
 * Memorama: parejas IGUALES (dos cartas con el mismo contenido) para buscar coincidencias.
 */
window.RALLY_DATOS = {
  memorama: [
    { id: 'sistemas-programacion', nombre: 'Programación y Sistemas', pares: [['PHP','PHP'],['Python','Python'],['Base de datos','Base de datos'],['Algoritmo','Algoritmo'],['API','API'],['Bug','Bug'],['Backend','Backend'],['Frontend','Frontend'],['HTML','HTML'],['JavaScript','JavaScript'],['MySQL','MySQL'],['Git','Git']] },
    { id: 'sistemas-redes', nombre: 'Redes y Conectividad', pares: [['Internet','Internet'],['IP','IP'],['Router','Router'],['Firewall','Firewall'],['WiFi','WiFi'],['Servidor','Servidor'],['DNS','DNS'],['HTTP','HTTP'],['Cloud','Cloud'],['Latencia','Latencia'],['Ancho de banda','Ancho de banda'],['Ciberseguridad','Ciberseguridad']] },
    { id: 'sistemas-software', nombre: 'Desarrollo de Software', pares: [['IDE','IDE'],['Depurar','Depurar'],['Variable','Variable'],['Función','Función'],['Bucle','Bucle'],['Condicional','Condicional'],['Array','Array'],['Objeto','Objeto'],['Framework','Framework'],['Testing','Testing'],['Deploy','Deploy'],['Refactorizar','Refactorizar']] },
    { id: 'sistemas-usabilidad', nombre: 'UX y Usabilidad', pares: [['UX','UX'],['UI','UI'],['Wireframe','Wireframe'],['Prototipo','Prototipo'],['Accesibilidad','Accesibilidad'],['Responsive','Responsive'],['Navegación','Navegación'],['Feedback','Feedback'],['Usabilidad','Usabilidad'],['Persona','Persona'],['Journey','Journey'],['A/B Test','A/B Test']] },
    { id: 'sistemas-vida-real', nombre: 'Sistemas en la Vida Real', pares: [['App móvil','App móvil'],['Banca en línea','Banca en línea'],['E-commerce','E-commerce'],['GPS','GPS'],['Streaming','Streaming'],['Redes sociales','Redes sociales'],['IoT','IoT'],['Smart city','Smart city'],['Telemedicina','Telemedicina'],['E-learning','E-learning'],['Blockchain','Blockchain'],['Big Data','Big Data']] },
    { id: 'datos-ia', nombre: 'Inteligencia Artificial', pares: [['Machine Learning','Machine Learning'],['Red neuronal','Red neuronal'],['Chatbot','Chatbot'],['Predicción','Predicción'],['Deep Learning','Deep Learning'],['Modelo','Modelo'],['Reconocimiento facial','Reconocimiento facial'],['Procesamiento de lenguaje','Procesamiento de lenguaje'],['Datos de entrenamiento','Datos de entrenamiento'],['Algoritmo','Algoritmo'],['Sesgo','Sesgo'],['Ética en IA','Ética en IA']] },
    { id: 'datos-analytics', nombre: 'Datos e Ingeniería de Datos', pares: [['Dato','Dato'],['Base de datos','Base de datos'],['Consulta SQL','Consulta SQL'],['Visualización','Visualización'],['Dashboard','Dashboard'],['ETL','ETL'],['Data Lake','Data Lake'],['Mineria de datos','Mineria de datos'],['Estadística','Estadística'],['Reporte','Reporte'],['Tiempo real','Tiempo real'],['Privacidad','Privacidad']] },
    { id: 'mecanica-energia', nombre: 'Energía y Mecánica', pares: [['Energía cinética','Energía cinética'],['Energía potencial','Energía potencial'],['Motor','Motor'],['Turbina','Turbina'],['Eficiencia','Eficiencia'],['Fuerza','Fuerza'],['Torque','Torque'],['Velocidad','Velocidad'],['Aceleración','Aceleración'],['Energía renovable','Energía renovable'],['Termodinámica','Termodinámica'],['Materiales','Materiales']] },
    { id: 'mecanica-automotriz', nombre: 'Ingeniería Automotriz', pares: [['Motor de combustión','Motor de combustión'],['Transmisión','Transmisión'],['Frenos','Frenos'],['Suspensión','Suspensión'],['Aerodinámica','Aerodinámica'],['Híbrido','Híbrido'],['Eléctrico','Eléctrico'],['Sensores','Sensores'],['CAD','CAD'],['Prototipo','Prototipo'],['Ensayo','Ensayo'],['Eficiencia energética','Eficiencia energética']] },
    { id: 'mecanica-robotica', nombre: 'Robótica y Automatización', pares: [['Robot','Robot'],['Sensor','Sensor'],['Actuador','Actuador'],['Controlador','Controlador'],['Automatización','Automatización'],['Industria 4.0','Industria 4.0'],['PLC','PLC'],['Cinemática','Cinemática'],['Grado de libertad','Grado de libertad'],['Precisión','Precisión'],['Feedback','Feedback'],['Colaborativo','Colaborativo']] },
    { id: 'curiosidades-ingenieria', nombre: 'Curiosidades de la Ingeniería', pares: [['Ada Lovelace','Ada Lovelace'],['Primer bug','Primer bug'],['Internet','Internet'],['GPS','GPS'],['Energía solar','Energía solar'],['Vehículo autónomo','Vehículo autónomo'],['Impresión 3D','Impresión 3D'],['Realidad virtual','Realidad virtual'],['Nanotecnología','Nanotecnología'],['Smartphone','Smartphone'],['Datos','Datos'],['Ingeniería','Ingeniería']] },
    { id: 'cultura-general', nombre: 'Cultura General', pares: [['Colombia','Colombia'],['Simón Bolívar','Simón Bolívar'],['Barranquilla','Barranquilla'],['Pablo Picasso','Pablo Picasso'],['Albert Einstein','Albert Einstein'],['NASA','NASA'],['Océano Pacífico','Océano Pacífico'],['Revolución Francesa','Revolución Francesa'],['ADN','ADN'],['Leonardo da Vinci','Leonardo da Vinci'],['Energía solar','Energía solar'],['Democracia','Democracia']] }
  ],
  quiz: [
    { p: '¿Qué significa HTML?', opciones: ['HyperText Markup Language','High Tech Modern Language','Home Tool Markup Language'], correcta: 0 },
    { p: '¿Qué hace un firewall en una red?', opciones: ['Acelera la conexión','Protege contra accesos no autorizados','Almacena datos'], correcta: 1 },
    { p: '¿Cuál es el lenguaje que se ejecuta en el navegador?', opciones: ['PHP','JavaScript','Python'], correcta: 1 },
    { p: '¿Qué es un algoritmo?', opciones: ['Un tipo de computadora','Una secuencia de pasos para resolver un problema','Un lenguaje de programación'], correcta: 1 },
    { p: '¿Qué significa IoT?', opciones: ['Internet of Things','Internal Operating Tool','Input Output Technology'], correcta: 0 },
    { p: '¿Qué es Machine Learning?', opciones: ['Un sistema operativo','Capacidad de aprender de datos sin programación explícita','Un tipo de base de datos'], correcta: 1 },
    { p: '¿Qué hace un chatbot?', opciones: ['Repara computadoras','Conversa con usuarios automáticamente','Diseña páginas web'], correcta: 1 },
    { p: '¿Qué mide el torque?', opciones: ['Velocidad','Fuerza de giro o rotación','Temperatura'], correcta: 1 },
    { p: '¿Qué es la energía cinética?', opciones: ['Energía almacenada','Energía del movimiento','Energía del sol'], correcta: 1 },
    { p: '¿Qué es un actuador en robótica?', opciones: ['Un sensor','Un componente que ejecuta movimiento o acción','Un programa'], correcta: 1 },
    { p: '¿En qué país se encuentra la Universidad Simón Bolívar (Barranquilla)?', opciones: ['Venezuela','Colombia','Ecuador'], correcta: 1 },
    { p: '¿Quién formuló la teoría de la relatividad?', opciones: ['Newton','Einstein','Galileo'], correcta: 1 },
    { p: '¿Qué continente tiene más población?', opciones: ['América','Europa','Asia'], correcta: 2 },
    { p: '¿En qué siglo llegó el hombre a la Luna?', opciones: ['XIX','XX','XXI'], correcta: 1 },
    { p: '¿Qué gas necesitan las plantas para la fotosíntesis?', opciones: ['Oxígeno','Dióxido de carbono','Nitrógeno'], correcta: 1 }
  ],
  pistas: [
    { pista: 'Soy un conjunto de pasos ordenados que resuelven un problema. Los programadores me escriben cada día. ¿Qué soy?', respuesta: 'algoritmo', indicio: 'Piensa en una receta o en instrucciones paso a paso.' },
    { pista: 'Nací como proyecto militar. Conecto computadoras de todo el mundo. ¿Cómo me llamo?', respuesta: 'internet', indicio: 'Red global que permite enviar correos y ver páginas web.' },
    { pista: 'Aprendo de los datos sin que me programen cada regla. Soy la base de muchos asistentes. ¿Qué soy?', respuesta: 'inteligencia artificial', indicio: 'Las máquinas que "aprenden" de ejemplos.' },
    { pista: 'Convierto la energía en movimiento giratorio. Estoy en autos, ventiladores y lavadoras. ¿Qué soy?', respuesta: 'motor', indicio: 'Giro y muevo cosas; uso electricidad o combustible.' },
    { pista: 'Soy un error en el software. Mi nombre viene de un insecto que encontraron dentro de una computadora. ¿Qué soy?', respuesta: 'bug', indicio: 'En inglés, "bicho". Los programadores me buscan para corregir.' },
    { pista: 'Almaceno información de forma estructurada. Las aplicaciones me consultan con un lenguaje de tres letras. ¿Qué soy?', respuesta: 'base de datos', indicio: 'SQL es el lenguaje con el que me preguntan cosas.' },
    { pista: 'Soy la "experiencia de usuario". Dos letras me representan. ¿Cuál es mi sigla?', respuesta: 'ux', indicio: 'Se refiere a cómo se siente el usuario al usar un producto.' },
    { pista: 'En robótica, soy el componente que ejecuta el movimiento. No solo miro el entorno, actúo. ¿Qué soy?', respuesta: 'actuador', indicio: 'El opuesto al sensor: yo hago que algo se mueva.' },
    { pista: 'Soy energía que no se agota: el sol, el viento, el agua. ¿Cómo me llaman?', respuesta: 'energia renovable', indicio: 'No uso combustibles fósiles como el petróleo.' },
    { pista: 'Soy un país de Sudamérica. Mi capital es Bogotá y tengo costa en dos océanos. ¿Quién soy?', respuesta: 'colombia', indicio: 'En mi territorio nació el café y la leyenda del Dorado.' },
    { pista: 'Libertador de varias naciones de América del Sur. Llevo su nombre en una universidad de Barranquilla. ¿Quién soy?', respuesta: 'simon bolivar', indicio: 'Nací en Caracas y mi sueño era la Gran Colombia.' },
    { pista: 'Soy la molécula que lleva la información genética. Tres letras me identifican. ¿Qué soy?', respuesta: 'adn', indicio: 'Estoy en el núcleo de las células; determino herencia.' }
  ],
  reto: [
    { tipo: 'ordenar', titulo: 'Ordena de menor a mayor (por tamaño de datos)', items: ['Bit','Byte','KB','MB','GB','TB'], orden_correcto: [0,1,2,3,4,5] },
    { tipo: 'ordenar', titulo: 'Ordena las fases del desarrollo de software', items: ['Diseño','Análisis','Implementación','Pruebas','Mantenimiento'], orden_correcto: [1,0,2,3,4] },
    { tipo: 'ordenar', titulo: 'Ordena el flujo de datos en una app web', items: ['Navegador','Servidor','Base de datos','Respuesta'], orden_correcto: [0,1,2,3] },
    { tipo: 'ordenar', titulo: 'Ordena de más antiguo a más reciente (inventos/hitos)', items: ['Rueda','Impresión','Electricidad','Internet','Smartphone'], orden_correcto: [0,1,2,3,4] }
  ]
};
