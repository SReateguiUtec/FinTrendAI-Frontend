<div align="center">

# FinTrend

Frontend web de **FinTrend**, una plataforma de analisis financiero con landing page, dashboard, noticias, senales de trading, seguimiento de portafolios y visualizaciones interactivas.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=0B1020)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)

![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-Data_Visualizations-F9A03C?style=for-the-badge&logo=d3&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-Configured-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

</div>

Este proyecto esta preparado para vivir en su propio repositorio y consumir los servicios de FinTrend por variables de entorno.

## Caracteristicas

- Landing page con visuales interactivos y animaciones.
- Dashboard financiero con vista general, noticias, senales y seguimiento.
- Componentes visuales avanzados como terminal financiero, LaserFlow y globo de mercado.
- Cliente HTTP centralizado con Axios y proxy de Vite para desarrollo.
- UI responsive con Tailwind CSS y componentes reutilizables.

## Tecnologias

- React 19 + TypeScript
- Vite 8
- Tailwind CSS
- React Router
- Axios
- Framer Motion / Motion
- D3, Three.js y OGL para visualizaciones
- Lucide React y Radix UI

## Requisitos

- Node.js
- npm

## Instalacion

```bash
npm install
```

Para desarrollo local, crea tu archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

## Variables de entorno

El frontend usa variables `VITE_*` para conectarse con los servicios externos:

```env
VITE_MS1_URL=http://localhost:5001
VITE_MS2_URL=http://localhost:5002
VITE_MS3_URL=http://localhost:5003
VITE_MS4_URL=http://localhost:5004
VITE_MS5_URL=http://localhost:5005
```

En desarrollo, Vite expone proxies locales:

- `/proxy/ms1`
- `/proxy/ms2`
- `/proxy/ms3`
- `/proxy/ms4`
- `/proxy/ms5`

Si no defines `.env`, el proxy usa los puertos locales por defecto `5001` a `5005`.

En produccion, define las variables `VITE_MS*_URL` antes de ejecutar el build.

Variable opcional:

```env
VITE_GITHUB_URL=https://github.com/tu-usuario/FinTrend
```

## Scripts

```bash
npm run dev
```

Inicia el servidor de desarrollo de Vite.

```bash
npm run build
```

Genera el build de produccion en `dist/`.

```bash
npm run preview
```

Sirve localmente el build generado.

```bash
npm run lint
```

Ejecuta ESLint sobre el proyecto.

## Estructura principal

```text
.
├── src/
│   ├── components/                 # Componentes reutilizables
│   │   ├── dashboard/              # Componentes del dashboard
│   │   │   ├── market-chart.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── signals-panel.tsx
│   │   │   ├── stat-card.tsx
│   │   │   └── topbar.tsx
│   │   │
│   │   ├── ui/                     # Componentes base y efectos visuales
│   │   │   ├── LaserFlow.tsx
│   │   │   ├── agent-plan.tsx
│   │   │   ├── color-orb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── motion-tiles.tsx
│   │   │   └── wireframe-dotted-globe.tsx
│   │   │
│   │   ├── BloombergTerminal.tsx   # Terminal financiero decorativo
│   │   ├── LaserFlowMain.tsx       # Hero visual con LaserFlow
│   │   ├── Earth.tsx               # Wrapper del globo interactivo
│   │   ├── hero.tsx                # Hero principal
│   │   ├── features-panel.tsx      # Panel de funcionalidades
│   │   ├── opening-scramble.tsx    # Animacion de apertura
│   │   └── site-footer.tsx         # Footer del sitio
│   │
│   ├── lib/
│   │   └── utils.ts                # Utilidades compartidas
│   │
│   ├── pages/                      # Paginas principales
│   │   ├── dashboard/              # Vistas internas del dashboard
│   │   │   ├── Analitica.tsx
│   │   │   ├── Noticias.tsx
│   │   │   ├── Seguimiento.tsx
│   │   │   ├── Senales.tsx
│   │   │   └── VistaGeneral.tsx
│   │   ├── Dashboard.tsx
│   │   └── Home.tsx
│   │
│   ├── services/                   # Clientes HTTP y llamadas a APIs
│   │   ├── api.ts
│   │   ├── analitica.ts
│   │   ├── noticias.ts
│   │   ├── portafolio.ts
│   │   ├── precios.ts
│   │   └── senales.ts
│   │
│   ├── App.tsx                     # Rutas y layout principal
│   ├── main.tsx                    # Punto de entrada React
│   ├── index.css                   # Estilos globales / Tailwind
│   └── vite-env.d.ts               # Tipos de variables Vite
│
├── .env.example                    # Plantilla de variables de entorno
├── package.json                    # Scripts y dependencias
├── tailwind.config.js              # Configuracion de Tailwind
├── tsconfig.json                   # Configuracion TypeScript
└── vite.config.ts                  # Configuracion Vite y proxy local
```

El alias `@` apunta a `src/`.

## Desarrollo

```bash
npm run dev
```

La app queda disponible normalmente en:

```text
http://localhost:5173
```

## Build y despliegue

```bash
npm run build
```

El resultado queda en `dist/`. Puedes desplegar esa carpeta en cualquier hosting estatico compatible con SPA, como Vercel, Netlify, Cloudflare Pages, S3 + CloudFront o Nginx.

Antes de desplegar, confirma que las variables `VITE_MS*_URL` apunten a los endpoints correctos del backend.

## Notas

- Este repositorio contiene solo el frontend.
- Los servicios consumidos por la app deben estar disponibles por las URLs configuradas.
- El proyecto usa mensajes neutros de error en la UI para evitar exponer detalles internos de infraestructura.
