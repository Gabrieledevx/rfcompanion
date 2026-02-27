# 🚀 Walkthrough Completo: Tu Propio "Lovable" (Generador de UI con IA)

Este documento contiene el plan paso a paso (Walkthrough) para crear desde CERO tu propio agente generador de interfaces (frontend) utilizando **NestJS** y la **API de Gemini**.

Este sistema tomará tu JSON de *Requerimientos Funcionales* y generará un proyecto de React/Angular completamente funcional, escribiendo los archivos en disco tal cual lo hace un desarrollador.

---

## 🏗️ Fase 1: Preparación e Inicialización del Backend (NestJS)

El backend será el "Cerebro" (Orquestador). Se encargará de recibir tu JSON, construir el súper-prompt y hablar con Gemini.

**1. Crea una nueva carpeta para el proyecto (fuera de tu agente actual):**
Abre una nueva terminal de comandos y ejecuta:
```bash
cd "c:\Users\gmedranda\Desktop\GMEDRANDA\AI AGENT\RF AGENT"
nest new ui-generator-backend
```
*(Elige `npm` como gestor de paquetes).*

**2. Entra al proyecto e instala las dependencias de IA:**
```bash
cd ui-generator-backend
npm install @google/genai dotenv zod
```
*(Usaremos el SDK oficial de Gemini, `dotenv` para tus keys, y `zod` para validar el JSON).*

---

## 📂 Fase 2: Arquitectura del Agente

Dentro de la carpeta `ui-generator-backend`, vamos a generar la estructura de módulos para nuestro agente generador.

**1. Ejecuta los comandos de generación de NestJS:**
```bash
nest g module generator
nest g service generator
nest g controller generator
```

Esto creará una carpeta `src/generator/` que contendrá toda la lógica de nuestro IA.

---

## 🧠 Fase 3: El "System Prompt" y el Esquema Zod

El secreto de Lovable o v0 no está en la magia, sino en cómo obligan al LLM a responder con un **JSON estructurado** que contiene la ruta de los archivos y su código, en lugar de simple texto conversacional.

**1. En `src/generator/generator.service.ts` importaremos el SDK de Google Gen AI:**

```typescript
import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type, Schema } from '@google/genai';

@Injectable()
export class GeneratorService {
  private ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 1. Definimos EXACTAMENTE cómo queremos que Gemini nos responda.
  // Le pedimos un Array de objetos, donde cada uno es un archivo a crear.
  private responseSchema: Schema = {
    type: Type.ARRAY,
    description: "Lista de archivos generados para el proyecto frontend.",
    items: {
      type: Type.OBJECT,
      properties: {
        path: {
          type: Type.STRING,
          description: "La ruta completa y nombre del archivo (ej: src/App.tsx, src/components/Button.tsx)",
        },
        code: {
          type: Type.STRING,
          description: "El código fuente completo y funcional del archivo.",
        },
      },
      required: ["path", "code"],
    },
  };

  async generateFrontend(functionalRequirementsJson: any) {
    const prompt = `
      Eres un Senior Frontend Developer experto en React (Vite) y Tailwind CSS.
      Basado en el siguiente JSON de Requerimientos Funcionales, tu tarea es 
      escribir TODOS los archivos necesarios para crear el frontend.
      
      Reglas estrictas:
      1. Usa React Funcional con Hooks.
      2. Usa Tailwind CSS para todo el diseño (hazlo moderno, estilo "shadcn/ui").
      3. Importa los íconos usando 'lucide-react'.
      4. Asegúrate de incluir el archivo 'package.json' y 'tailwind.config.js' en la lista.
      
      Requerimientos:
      ${JSON.stringify(functionalRequirementsJson, null, 2)}
    `;

    // 2. Llamada a Gemini forzando el formato JSON estructurado
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro', // Usamos el modelo más capaz para código
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: this.responseSchema, 
        temperature: 0.2, // Baja temperatura para código más preciso y menos alucinaciones
      }
    });

    // 3. El resultado ya será un string formato JSON que podemos parsear
    const generatedFiles = JSON.parse(response.text());
    
    // 4. Guardamos los archivos en el disco duro!
    await this.writeFilesToDisk(generatedFiles);
    
    return { message: "Frontend generado con éxito!", filesCount: generatedFiles.length };
  }
}
```

---

## 💾 Fase 4: Escribir el código en tu Computadora (VFS local)

Aún en `generator.service.ts`, implementamos la función que toma la respuesta de Gemini y la convierte en archivos reales en tu PC.

```typescript
import * as fs from 'fs';
import * as path from 'path';

  // Añadir esta función dentro del GeneratorService
  private async writeFilesToDisk(files: Array<{path: string, code: string}>) {
    const outputDir = path.join(process.cwd(), 'generated-project');
    
    for (const file of files) {
      const fullPath = path.join(outputDir, file.path);
      const dir = path.dirname(fullPath);
      
      // Crea las carpetas recursivamente si no existen (ej: src/components/ui/)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Escribe el archivo con el código de Gemini
      fs.writeFileSync(fullPath, file.code, 'utf-8');
    }
  }
```

---

## 🔗 Fase 5: El Controlador (Endpoint)

En `src/generator/generator.controller.ts`, creamos la ruta que recibe tu JSON original (el que te generó tu agente anterior).

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { GeneratorService } from './generator.service';

@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post('generate-frontend')
  async createFrontend(@Body() functionalRequirementsJson: any) {
    return this.generatorService.generateFrontend(functionalRequirementsJson);
  }
}
```

---

## 🏁 Fase 6: Flujo de Ejecución (¡A probarlo!)

1. Levanta tu servidor NestJS:
```bash
npm run start:dev
```
2. Desde Postman (o con un script simple), envías un `POST` a `http://localhost:3000/generator/generate-frontend` con el JSON de tus Requerimientos Funcionales en el body.
3. El agente leerá tu JSON, usará **Gemini 2.5 Pro**, generará la estructura y **verás cómo mágicamente aparece una carpeta `generated-project/` en tu editor de código** llena con los archivos de React, Tailwind, package.json, y componentes.
4. Vas a la terminal, entras en esa carpeta (`cd generated-project`), haces `npm install` y luego `npm run dev`. ¡BOOM! Tu diseño estará en el puerto 5173.

---
## 🌟 ¿Qué sigue después de esto? (Evolución a estilo Lovable)

Una vez que domines este backend, el siguiente paso es hacerlo **visual**:
En lugar de guardar los archivos localmente con `fs.writeFileSync`, tu backend le devolverá el JSON al Frontend, y usarás **Sandpack (de CodeSandbox)** o **WebContainers** para ejecutar ese código *dentro del navegador web* en tiempo real, ¡exactamente como hace Lovable!
