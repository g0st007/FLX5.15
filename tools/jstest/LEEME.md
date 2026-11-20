# Pruebas del JS de detección (sin compilar la app)

El JS de `BrowserController.kt` (SNIFF_JS y SHIELD_JS) se puede comprobar con node, sin compilar Android:

```
cd tools/jstest
python3 extract.py          # saca los .js del Kotlin
node --check SNIFF_JS.js    # sintaxis
node --check SHIELD_JS.js
node t_gate.js              # PH (blob/m3u8) no debe tocar el reproductor; Bunny (mp4 directo) sí recorre
node t_walk.js              # recorrido simulado de calidades (360/480/720/1080) con un reproductor falso
```

`harness.js` crea un entorno falso (window, document, reproductor, menú de calidades, puente `B`) y registra las llamadas al puente.
Esto NO sustituye a compilar y probar en el teléfono: no comprueba el Kotlin ni los sitios reales.
