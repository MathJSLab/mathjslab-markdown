# Simulação interativa: registrador com enable

Requer uma sessão interativa fornecida e autorizada pelo aplicativo. Avançar
aplica as entradas e simula 10 ns. Executar repete passos; Pausar mantém o
estado. Reiniciar encerra a sessão e restaura as entradas. Os exemplos
sequenciais geram internamente um clock de 10 ns; este código de teste não é
destinado à síntese.

## VHDL

```vhdl-live {width=100%}
{
  "top": "live_register",
  "standard": "08",
  "files": [
    {
      "name": "live_register.vhd",
      "source": "library ieee;use ieee.std_logic_1164.all;entity live_register is port(d:in std_logic_vector(3 downto 0);enable:in std_logic;q:out std_logic_vector(3 downto 0));end;architecture test of live_register is signal clk:std_logic:='0';signal value:std_logic_vector(3 downto 0):=(others=>'0');begin clk<=not clk after 5 ns;q<=value;process(clk)begin if rising_edge(clk)then if enable='1'then value<=d;end if;end if;end process;end;"
    }
  ],
  "inputs": [
    {
      "name": "d",
      "width": 4,
      "initial": "0101"
    },
    {
      "name": "enable",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "q",
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
  "top": "live_register",
  "standard": "2012",
  "files": [
    {
      "name": "live_register.sv",
      "source": "module live_register(input[3:0]d,input enable,output reg[3:0]q=0);reg clk=0;always #5 clk=~clk;always @(posedge clk) if(enable)q<=d;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "d",
      "width": 4,
      "initial": "0101"
    },
    {
      "name": "enable",
      "width": 1,
      "initial": "1"
    }
  ],
  "outputs": [
    {
      "name": "q",
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

Resposta: Após o primeiro avanço, q=0101. Com enable=0, mudar d não altera q.
Restaurar enable=1 permite capturar d no próximo avanço. Após Reiniciar, as
saídas voltam a x até uma nova execução.
