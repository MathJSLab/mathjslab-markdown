# Simulação interativa: porta AND

Execução no cliente: o aplicativo deve autorizar createBrowserHDLExecutor e
hospedar seus assets WebAssembly/Worker. Verilog usa Icarus e YoWASP no
navegador, sem serviço, token ou sessionStorage. Síntese VHDL-2008 usa GHDL e YoWASP
no navegador; simulação e interatividade VHDL-2008 usam o runtime NVC. O
Markdown não pode autorizar execução. Consulte
doc/extensions/hdl-troubleshooting.md e doc/hdl-browser-results.md.

Requer uma sessão interativa fornecida e autorizada pelo aplicativo. Avançar
aplica as entradas e simula 10 ns. Executar repete passos; Pausar mantém o
estado. Reiniciar encerra a sessão e restaura as entradas. Os exemplos
sequenciais geram internamente um clock de 10 ns; este código de teste não é
destinado à síntese.

## VHDL

```vhdl-live {width=100%}
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
  "stopTimeNs": 1000
}
```

## Verilog / SystemVerilog

```verilog-live {width=100%}
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
  "stopTimeNs": 1000
}
```

## Atividade

Altere uma entrada, avance e compare a saída. Pause e confira que o tempo não
muda sozinho. Reinicie e verifique o estado inicial.

Resposta: Após o primeiro avanço, y=0. Com a=b=1, o próximo avanço mostra y=1.
Após Reiniciar, as saídas voltam a x até uma nova execução.
