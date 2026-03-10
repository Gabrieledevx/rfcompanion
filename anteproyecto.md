# Anteproyecto de Tesis: Agente de Inteligencia Artificial para la Generación de Requerimientos Funcionales

## TEMA: 
**Desarrollo de un Agente Inteligente basado en Modelos de Lenguaje (LLMs) y Bases de Datos Vectoriales para la Elicitación, Análisis y Generación Automática de Requerimientos de Software y Estimaciones Ágiles.**

---

## PLANTEAMIENTO DEL PROBLEMA: 
En el ciclo de vida del desarrollo de software, la fase de levantamiento y análisis de requerimientos suele ser una de las más críticas y propensas a errores, ambigüedades y omisiones. La falta de estandarización al redactar casos de uso, la habitual omisión de requerimientos no funcionales (escalabilidad, seguridad, accesibilidad) y la incapacidad de los analistas para aprovechar sistemáticamente el contexto o lecciones de proyectos anteriores originan re-trabajos y sobrecostos. La dependencia técnica y manual de especialistas humanos para transformar ideas abstractas en especificaciones rigurosas y planes de ejecución se convierte frecuentemente en un cuello de botella, retrasando la validación del proyecto y aumentando el nivel de incertidumbre desde las fases iniciales de concepción del producto.

---

## OBJETIVOS DE LA INVESTIGACIÓN

**Objetivo General:**
Desarrollar un agente de software inteligente, integrando Modelos de Lenguaje Grande (LLMs) y Retrieval-Augmented Generation (RAG), capaz de procesar ideas de negocio en lenguaje natural para estructurar y automatizar rigurosamente la generación de requerimientos funcionales, no funcionales y planes de iteración ágil (sprints) de un proyecto de software.

**Objetivos específicos:**
1. **Diseñar la arquitectura del agente inteligente** utilizando un orquestador backend modular (ej. NestJS) que integre librerías de procesamiento de lenguaje natural (LangChain) para conectar con modelos LLM comerciales (como Google Gemini o OpenAI).
2. **Implementar un sistema de memoria semántica compartida (RAG)** empleando bases de datos vectoriales (ej. PostgreSQL con pgvector) para recuperar el contexto de proyectos anteriores y sugerir recomendaciones arquitectónicas más robustas al agente.
3. **Desarrollar una infraestructura de procesamiento asíncrono** mediante el uso de colas de mensajes (como BullMQ y Redis) para gestionar los tiempos de respuesta del modelo, garantizando la escalabilidad y proporcionando retroalimentación del progreso en tiempo real al usuario.
4. **Evaluar y validar la precisión y exhaustividad** de las especificaciones de salida generadas por el sistema (estructuradas en formato unificado JSON), comparándolas objetivamente contra estándares metodológicos para documentar Casos de Uso, Criterios de Aceptación, Modelos de Datos, y Reglas de Negocio.

---

## ALCANCE DEL PROYECTO

**Roles disponibles en el sistema:**
1. **Usuario Analista / Product Owner:** End-user que ingresa la idea inicial del proyecto, detalla la descripción, establece fechas objetivo y valida o itera sobre los requerimientos que genera el sistema.
2. **Agente IA (Rol Emulado por el Sistema):** Actor inteligente que funge simultáneamente como Analista de Negocios, Arquitecto de Software y UX Researcher. Se encarga de procesar la entrada, contextualizarla, estructurarla y devolver las estimaciones, los diagramas lógicos, vulnerabilidades (OWASP), etc.

**El prototipo propuesto se enfocará en los siguientes módulos:**
* **Módulo de Recepción (API/CLI):** Capa de entrada que captura la idea, descripción y parámetros base del proyecto.
* **Módulo de Orquestación e Inferencia:** Corazón del agente donde se formulan los *prompts* enriquecidos para el LLM y se configuran *parsers* para asegurar estrictamente como salida un formato JSON definido.
* **Módulo de Retención y Recuperación Vectorial (Semántica):** Encargado de transformar y guardar los proyectos exitosos previos en "Embeddings" (vectores) para realizar búsquedas de similitud (similarity search) y agregarlas al conocimiento temporal del Agente al procesar un proyecto similar nuevo.
* **Módulo de Procesamiento en Segundo Plano:** Motor de gestión de colas distribuido que procesa y emite notificaciones de progreso gradualmente mientras el LLM "piensa" y consolida la abstracción del negocio.

**El prototipo web planteado considerará:**
* Una **arquitectura backend sólida** e interfaces tipo API o por consola de comandos que demuestren el flujo asíncrono del sistema.
* Un **panel central o Endpoint** desde donde se despachen tareas al agente y desde donde se interactúe con los resultados procesados, que incluyen por defecto iteraciones ágiles generadas autómaticamente, historias de usuario estructuradas (Given/When/Then), integraciones a nivel de terceros, e impacto en bases de datos.

---

## LIMITACIONES DEL PROYECTO
* **Dependencia de Proveedores de IA de Terceros:** El correcto funcionamiento de la solución y los tiempos de latencia estarán directa u obligatoriamente sujetos a la estabilidad, políticas, límites de tokens temporales de las APIs de Google Gemini, OpenAI o el proveedor del modelo adoptado.
* **Calidad Dependiente del Prompt (Garbage In - Garbage Out):** La exhaustividad y viabilidad de las arquitecturas recomendadas y el modelo de datos generado dependerán profundamente de la claridad inicial descriptiva suministrada por el usuario, siendo incapaz de inferir flujos ocultos no descritos al menos semánticamente.
* **Límite de Ventana de Contexto (Token Limits):** Ideas empresariales excesivamente extensas y complejas pueden rebasar los límites del input de los modelos gratuitos utilizados, induciendo truncamientos en la salida JSON o errores de análisis durante el *parsing*.

---

## JUSTIFICACIÓN E IMPORTANCIA

**Justificación:**
El esfuerzo y conocimiento técnico requeridos para traducir las visiones funcionales de un Product Owner hacia especificaciones técnicas estructuradas ha sido tradicionalmente pesado. Este proyecto encuentra su justificación en la urgencia por optimizar el ciclo temprano de desarrollo de software (Ingeniería de Requerimientos) a través del estado del arte en Inteligencia Artificial Generativa. Al dotar al agente de herramientas como recuperación de contextos pasados (RAG), superamos los agentes convencionales y evitamos reinventar la rueda; mitigando así riesgos al identificar desde temprano patrones paralelos o flujos excepcionales ya descubiertos en otros desarrollos y arquitecturas.

**Importancia del Proyecto:**
Implementar esta solución marca un antecedente valioso no solo por la tecnología empleada (TypeScript robusto, NestJS interactuando con LangChain y bases vectoriales), sino por el valor directo de negocio: permite **reducir semanas de planificación técnica manual a escasos minutos u horas**, garantizando un marco inicial muy fuerte que abarca componentes habitualmente ignorados por desarrolladores junior (Observabilidad, Internacionalización, OWASP, Retención de Datos). 

---

## METODOLOGÍA A EMPLEARSE

**METODOLOGÍA DE INVESTIGACIÓN: DESCRIPTIVA Y EXPLORATORIA**
* **Características principales:** Con un enfoque mixto, se encarga de explorar empíricamente la efectividad integrativa de los modelos LLM recién introducidos combinados con metodologías RAG. Paralelamente, describe organizadamente el comportamiento, precisión y limitaciones al sistematizar los procesos humanos de análisis a nivel software.
* **Aplicación en el proyecto:** Se contrastará la calidad del JSON arrojado por el Agente contra métricas tradicionales de desarrollo de software para describir objetivamente la ganancia del uso de IA en cada fase del análisis del negocio. Además, se explorará el efecto de alimentar a la IA vectorial con proyectos cada vez más grandes para ver cómo varía la salida.

**METODOLOGÍA DE DESARROLLO: ITERATIVO E INCREMENTAL (ÁGIL)**
* **Aplicación en el proyecto:** El proyecto en sí se regirá bajo lineamientos ágiles. Se programarán iteraciones para construir un MVP enfocado inicialmente en el envío asíncrono y en conectar el LLM en su nivel básico. Incrementos subsecuentes desarrollarán el guardado transaccional en PG, el acoplamiento vectorial para RAG (Retrieval-Augmented Generation) y la calibración exhaustiva de las instrucciones (prompts) y esquemas tipo Zod dentro de los *Use Cases* del agente.
