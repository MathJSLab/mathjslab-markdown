# Reading data: tables, units and provenance

**Objective:** organize measurements and assess what the data support.
**Extensions:** relative-urls, heading-ids, syntax-highlight and MathJax; GFM
tables.

## Reading guide

Navigate to [Activity data](#activity-data) and then to
[Interpretation](#interpretation). Headings provide the navigation identifiers.
The [CSV file](resources/temperaturas.csv) is a local resource resolved
relative to this note's address.

## Activity data

The measurements below are **simulated**, in degrees Celsius, for three times
on a single day. They do not represent a city's climate.

| Time  | Temperature (°C) |
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

The header identifies the variable and its unit. The CSV stores values; the
table arranges the same information for human reading. The original column
identifiers are retained: `horario` means time, and `temperatura_c` means
temperature in degrees Celsius.

## Interpretation

The highest measurement was 26 °C at noon. The difference between the highest
and lowest is 6 °C. Three observations do not determine the day's actual
maximum: it may have occurred between measurement times. Nor do they
characterize climate, which requires series of observations over longer
periods.

## Practice

- [ ] Identify the unit before comparing values.
- [ ] Calculate the arithmetic mean of the three observations.
- [ ] Explain a conclusion these data do not support.

## Answers with explanations

The unit is °C; the observation mean is $70/3\approx23.33$ °C. We cannot claim
that 26 °C was the daily maximum or infer a climate trend. See also
[the statistics lesson](estatistica.md).
