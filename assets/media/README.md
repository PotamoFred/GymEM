# Medios

Recursos de vídeo opcionales para el fondo del hero.

Coloca aquí `hero-loop.mp4` y actívalo en `assets/js/main.js`:

```js
heroVideo: 'assets/media/hero-loop.mp4',
```

## Especificaciones recomendadas

- **Formato:** MP4 (H.264) + fuente WebM opcional
- **Duración:** 6–12 s en loop
- **Peso:** menos de 3 MB
- **Resolución:** 1080×1350 (portrait) o 1920×1080
- **Sin audio:** el elemento se crea con `muted` para cumplir la política de
  autoplay de los navegadores

El vídeo se reproduce en bucle, a bajo opacity y detrás del velo oscuro
(`.hero__scrim`), así que solo aporta textura y profundidad al fondo.
