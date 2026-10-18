# Simulação interativa: multiplexador

Requer uma sessão interativa fornecida e autorizada pelo aplicativo. Avançar
aplica as entradas e simula 10 ns. Executar repete passos; Pausar mantém o
estado. Reiniciar encerra a sessão e restaura as entradas. Os exemplos
sequenciais geram internamente um clock de 10 ns; este código de teste não é
destinado à síntese.

## VHDL

```vhdl-live {width=100%}
{
  "top": "live_mux",
  "standard": "08",
  "files": [
    {
      "name": "live_mux.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; entity live_mux is port(a,b:in std_logic_vector(3 downto 0);s:in std_logic;y:out std_logic_vector(3 downto 0));end; architecture rtl of live_mux is begin y<=a when s='0' else b;end;"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 4,
      "initial": "0011"
    },
    {
      "name": "b",
      "width": 4,
      "initial": "1010"
    },
    {
      "name": "s",
      "width": 1,
      "initial": "0"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 4
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Verilog / SystemVerilog

```verilog-live {width=100%}
{
  "top": "live_mux",
  "standard": "2012",
  "files": [
    {
      "name": "live_mux.sv",
      "source": "module live_mux(input [3:0]a,b,input s,output [3:0]y);assign y=s?b:a;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "a",
      "width": 4,
      "initial": "0011"
    },
    {
      "name": "b",
      "width": 4,
      "initial": "1010"
    },
    {
      "name": "s",
      "width": 1,
      "initial": "0"
    }
  ],
  "outputs": [
    {
      "name": "y",
      "width": 4
    }
  ],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

## Atividade

Altere uma entrada, avance e compare a saída. Pause e confira que o tempo não
muda sozinho. Reinicie e verifique o estado inicial.

Resposta: Após o primeiro avanço, y=0011. Com s=1, o próximo avanço mostra
y=1010. Após Reiniciar, as saídas voltam a x até uma nova execução.
