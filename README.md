# BacheSCZ

Aplicación móvil Expo + React Native para reportar baches en Santa Cruz de la Sierra.

## Ejecutar

```bash
pnpm install
npx expo start
```

Escanea el QR con Expo Go. La primera versión utiliza AsyncStorage y datos ficticios locales, con servicios separados para reemplazar fácilmente el repositorio por una API, autenticación, almacenamiento de imágenes y heatmap real.

## Estructura

- `app/`: rutas Expo Router y tabs
- `src/types`: modelos de dominio
- `src/services`: persistencia y futura API
- `src/components`: UI reutilizable
- `src/mocks`: datos de Santa Cruz
