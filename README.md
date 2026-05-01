# 🏙️ PROSTIR — Urban OS

> **ПРОгресивно. ПРОзоро. ПРОсто.**  
> Tu ritmo urbano personal.

[![Demo en vivo](https://img.shields.io/badge/Ver-Demo-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white)](https://shepiitkod.github.io/prostir-web/)
[![TypeScript](https://img.shields.io/badge/TypeScript-TSX-blue?style=for-the-badge&logo=typescript)]
[![React](https://img.shields.io/badge/React-UI-61DAFB?style=for-the-badge&logo=react)]
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)]

---

## 🌐 Demo

🔗 https://shepiitkod.github.io/prostir-web/

> Puedes probar la aplicación directamente desde tu navegador sin necesidad de instalar nada.

---

## 🚀 Descripción

**PROSTIR** es una plataforma digital urbana que integra múltiples servicios en una sola aplicación, diseñada para simplificar la vida en la ciudad.

Permite a los usuarios:

- 🍽️ Reservar restaurantes  
- 💻 Apartar espacios de coworking  
- 🤝 Conectar con personas cercanas  
- 👤 Gestionar su perfil y actividades  

Construido con **React + TypeScript (TSX)** y un backend ligero en Node.js.

---

## 🧩 Módulos

| Módulo | Descripción |
|-------|------------|
| 🍽️ **Dine** | Reserva de mesas con plano interactivo |
| 💻 **Working** | Reservación de espacios de trabajo |
| 🌐 **Moments** | Conexión social con enfoque en privacidad |
| 🏢 **Business** | Panel para negocios y socios |
| 👤 **Profile** | Perfil de usuario y configuración |

---

## ✨ Características

- 🔐 Autenticación rápida (lista para integración con Diia)  
- ⚡ Navegación fluida con React  
- 🎨 Interfaz moderna (modo oscuro / claro)  
- 🌍 Soporte multi-idioma  
- 📊 Visualización dinámica de datos  
- 📱 Diseño totalmente responsive  
- 🧠 Animaciones e interacciones avanzadas  

---

## 🧱 Tecnologías utilizadas

### Frontend (TSX)
- **React + TypeScript (TSX)**  
- CSS moderno (variables, flexbox, grid)  
- Hooks y manejo de estado  

### Backend
- **Node.js + Express**  
- API REST  
- Base de datos JSON ligera  

---

## 🏗️ Estructura del Proyecto

```bash
📦 prostir
 ┣ 📂 src
 ┃ ┣ 📂 components
 ┃ ┣ 📂 pages
 ┃ ┣ 📂 hooks
 ┃ ┣ 📂 services
 ┃ ┗ 📜 App.tsx
 ┣ 📂 public
 ┣ 📜 server.js
 ┣ 📜 db.json
 ┣ 📜 package.json
 ┗ 📜 README.md
```
---

## 🔌 API Endpoints

| Método | Endpoint                  | Descripción            |
|--------|---------------------------|------------------------|
| GET    | /api/tables/:venueId      | Obtener mesas          |
| GET    | /api/desks/:venueId       | Obtener espacios       |
| GET    | /api/bookings             | Listar reservas        |
| POST   | /api/book                 | Crear reserva          |
| DELETE | /api/bookings/:id         | Cancelar reserva       |

---

## 🧪 Instalación
# Clonar repositorio
```
git clone https://github.com/shepiitkod/prostir-web.git
```
# Entrar al proyecto
```
cd prostir-web
```
# Instalar dependencias
```
npm install
```
# Ejecutar en desarrollo
```
npm run dev
```
---

## ⚙️ Scripts disponibles

- npm run dev      # Ejecutar en desarrollo
- npm run build    # Compilar para producción
- npm run preview  # Vista previa del build
- npm start        # Ejecutar backend

---

🎨 Sistema de Diseño

Elemento	Valor
- 🎨 Color principal	#8B5CF6
- ⚫ Modo oscuro	#000000
- ⚪ Modo claro	#FFFFFF
- 🔤 Tipografía	System UI / Inter
- 📐 Grid base	8px
- ⚡ Animaciones	cubic-bezier(0.22, 1, 0.36, 1)

---

## 📈 Estado del Proyecto

- 🟢 Frontend completo
- 🟡 Backend en desarrollo
- 🚧 Integraciones pendientes

---

## 👨‍💻 Autor

**Isai Reyes**

---

## 📄 Licencia

MIT License
