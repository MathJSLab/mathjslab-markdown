# Lectura de datos: tabla, unidad y procedencia

**Objetivo:** organizar mediciones y evaluar qué permiten concluir los datos.
**Extensiones:** relative-urls, heading-ids, syntax-highlight y MathJax; tablas
GFM.

## Guía de lectura

Navega a [Datos de la actividad](#datos-de-la-actividad) y después a
[Interpretación](#interpretación). Los títulos proporcionan los identificadores
de navegación. El [archivo CSV](resources/temperaturas.csv) es un recurso local
que se resuelve respecto a la dirección de este apunte.

## Datos de la actividad

Las mediciones siguientes son **simuladas**, en grados Celsius, para tres
horarios de un solo día. No representan el clima de una ciudad.

| Hora  | Temperatura (°C) |
| ----- | ---------------: |
| 08:00 |               20 |
| 12:00 |               26 |
| 16:00 |               24 |

```csv
horario,temperatura_c
08:00,20
12:00,26
16:00,24
```

El encabezado identifica la variable y su unidad. El CSV guarda valores; la
tabla organiza la misma información para la lectura humana. Se conservan los
identificadores originales de las columnas: `horario` significa hora y
`temperatura_c`, temperatura en grados Celsius.

## Interpretación

La mayor medición fue 26 °C al mediodía. La diferencia entre la mayor y la
menor es 6 °C. Tres observaciones no determinan la máxima real del día: puede
haberse producido entre los horarios medidos. Tampoco permiten caracterizar el
clima, que requiere series de observaciones en períodos más largos.

## Practica

- [ ] Identifica la unidad antes de comparar los valores.
- [ ] Calcula la media aritmética de las tres observaciones.
- [ ] Explica una conclusión que estos datos no respaldan.

## Respuestas comentadas

La unidad es °C; la media de las observaciones es $70/3\approx23{,}33$ °C. No
se puede afirmar que 26 °C fue la máxima diaria ni inferir una tendencia
climática. Consulta también [la clase de estadística](estatistica.md).
