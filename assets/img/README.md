# Imágenes

Coloca aquí los recursos gráficos. La página funciona aunque falten: cada
componente tiene un respaldo visual en CSS (degradado, monograma, ícono).

| Archivo           | Estado  | Uso                                        | Tamaño      | Peso     |
| ----------------- | ------- | ------------------------------------------ | ----------- | -------- |
| `hero.jpg`        | ✅ listo | Fondo del hero (escritorio)                | 1376×768    | 202 KB   |
| `hero-800.jpg`    | ✅ listo | Fondo del hero (móvil, vía `srcset`)       | 800×447     | 73 KB    |
| `entrenador.jpg`  | ✅ listo | Foto del entrenador en "Sobre Mí"         | 720×980     | 96 KB    |
| `og-cover.jpg`    | falta   | Imagen de compartir en redes (1200×630)    | 1200×630    | < 120 KB |
| `favicon.svg`     | falta   | Ícono del sitio                            | 1:1         | < 5 KB   |
| `hero-poster.jpg` | opcional | Fotograma del vídeo de fondo               | 16:10       | < 60 KB  |

> **Cómo funciona el fondo del hero.** El `<img>` declara `srcset` con dos
> variantes, así que el móvil descarga `hero-800.jpg` (73 KB) y el escritorio
> `hero.jpg` (202 KB). Para cambiar el encuadre, ajusta `object-position` en
> `styles.css`:
> `.hero__image` (escritorio) y su equivalente móvil en el breakpoint de 720 px.
>
> **Sobre `entrenador.jpg`.** Está recortada para eliminar el bloque de texto con
> el número de teléfono. El marco `.about__photo` es 4:5 y la imagen se recorta
> con `object-fit: cover` (`object-position: center 18%`). Si consigues un retrato
> vertical propio, sustituye el archivo: no hace falta tocar el HTML.

## Convertir a formatos modernos

```bash
# WebP y AVIF desde JPG (requiere cwebp / avifenc)
cwebp -q 78 hero.jpg -o hero.webp
avifenc -q 50 hero.jpg -o hero.avif
```

## Vídeo de fondo del hero (opcional)

1. Exporta un clip vertical/horizontal corto y **liviano**:
   MP4 (H.264) de 6–12 s, en loop, < 3 MB, 1080×1350 o 1920×1080.
2. Guárdalo en `assets/media/hero-loop.mp4`.
3. Actívalo en `assets/js/main.js`:

   ```js
   heroVideo: 'assets/media/hero-loop.mp4',
   ```

   Si el archivo no existe, el vídeo se elimina solo y queda la imagen.
