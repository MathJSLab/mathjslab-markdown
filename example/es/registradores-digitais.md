# Registros digitales: campos y formatos

Los ejemplos son declarativos. Los diagramas muestran la estructura; no
ejecutan una simulación.

## 1. Control

```wavedrom
{
  "reg": [
    {
      "bits": 1,
      "name": "EN",
      "attr": "RW"
    },
    {
      "bits": 3,
      "name": "MODE"
    },
    {
      "bits": 4,
      "name": "FLAGS"
    }
  ],
  "config": {
    "bits": 8
  }
}
```

## 2. Instrucción

```wavedrom {width=75%}
{
  "reg": [
    {
      "bits": 8,
      "name": "IMM"
    },
    {
      "bits": 4,
      "name": "RD"
    },
    {
      "bits": 4,
      "name": "OP"
    }
  ],
  "config": {
    "bits": 16,
    "lanes": 2
  }
}
```

## 3. Estado

```wavedrom
{
  "reg": [
    {
      "bits": 1,
      "name": "C",
      "type": 2
    },
    {
      "bits": 1,
      "name": "Z",
      "type": 3
    },
    {
      "bits": 1,
      "name": "N",
      "type": 4
    },
    {
      "bits": 5,
      "name": "RESERVED"
    }
  ],
  "config": {
    "bits": 8
  }
}
```

## 4. Palabra de datos

```wavedrom
{
  "reg": [
    {
      "bits": 8,
      "name": "B0"
    },
    {
      "bits": 8,
      "name": "B1"
    },
    {
      "bits": 8,
      "name": "B2"
    },
    {
      "bits": 8,
      "name": "B3"
    }
  ],
  "config": {
    "bits": 32,
    "lanes": 4
  }
}
```
