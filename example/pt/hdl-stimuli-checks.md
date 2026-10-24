# HDL: estímulos e verificações

Execução no cliente: o aplicativo deve autorizar createBrowserHDLExecutor e
hospedar seus assets WebAssembly/Worker. Verilog usa Icarus e YoWASP no
navegador, sem serviço, token ou sessionStorage. Síntese VHDL-2008 usa GHDL e
YoWASP no navegador; simulação e interatividade VHDL-2008 usam o runtime NVC. O
Markdown não pode autorizar execução. Consulte
doc/extensions/hdl-troubleshooting.md e doc/hdl-browser-results.md.

Execute a sequência e inspecione as verificações. As entradas mudam em 0 e 7
ns. A saída é verificada em 7 e 12 ns. Reiniciar restaura a sequência.

## VHDL

```vhdl-live
{
  "top": "live_and",
  "standard": "08",
  "files": [
    {
      "name": "live_and.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; entity live_and is port(a,b:in std_logic;y:out std_logic);end; architecture rtl of live_and is begin y<=a and b;end;"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 1,
      "initial": "0"
    },
    {
      "name": "b",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 1
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 12,
  "stimuli": [
    {
      "timeNs": 0,
      "inputs": {
        "a": "1"
      }
    },
    {
      "timeNs": 7,
      "inputs": {
        "a": "0"
      }
    }
  ],
  "checks": [
    {
      "id": "on",
      "timeNs": 7,
      "signal": "y",
      "expected": "1"
    },
    {
      "id": "off",
      "timeNs": 12,
      "signal": "y",
      "expected": "0"
    }
  ]
}
```

## Verilog

```verilog-live
{
  "top": "live_and",
  "standard": "2012",
  "files": [
    {
      "name": "live_and.sv",
      "source": "module live_and(input a,b,output y);assign y=a&b;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 1,
      "initial": "0"
    },
    {
      "name": "b",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 1
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 12,
  "stimuli": [
    {
      "timeNs": 0,
      "inputs": {
        "a": "1"
      }
    },
    {
      "timeNs": 7,
      "inputs": {
        "a": "0"
      }
    }
  ],
  "checks": [
    {
      "id": "on",
      "timeNs": 7,
      "signal": "y",
      "expected": "1"
    },
    {
      "id": "off",
      "timeNs": 12,
      "signal": "y",
      "expected": "0"
    }
  ]
}
```

## Inspeção e exportação

Após executar a sequência, exporte JSON e inspecione os resultados das
verificações e o histórico confirmado das entradas. Exporte TXT do último log
confirmado. Pause e aguarde qualquer avanço pendente antes de exportar.
Reiniciar limpa os resultados do relatório e restaura o plano.
