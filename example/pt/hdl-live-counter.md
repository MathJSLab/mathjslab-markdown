# Simulação interativa: contador e reset

Execução no cliente: o aplicativo deve autorizar createBrowserHDLExecutor e
hospedar seus assets WebAssembly/Worker. Verilog usa Icarus e YoWASP no
navegador, sem serviço, token ou sessionStorage. Síntese VHDL-2008 usa GHDL e
YoWASP no navegador; simulação e interatividade VHDL-2008 usam o runtime NVC. O
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
  "top": "live_counter",
  "standard": "08",
  "files": [
    {
      "name": "live_counter.vhd",
      "source": "library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity live_counter is port(rst:in std_logic;q:out std_logic_vector(3 downto 0));end;architecture test of live_counter is signal clk:std_logic:='0';signal value:unsigned(3 downto 0):=(others=>'0');begin clk<=not clk after 5 ns;q<=std_logic_vector(value);process(clk)begin if rising_edge(clk)then if rst='1'then value<=(others=>'0');else value<=value+1;end if;end if;end process;end;"
    }
  ],
  "inputs": [
    {
      "name": "rst",
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
  "top": "live_counter",
  "standard": "2012",
  "files": [
    {
      "name": "live_counter.sv",
      "source": "module live_counter(input rst,output reg[3:0]q);reg clk=0;always #5 clk=~clk;always @(posedge clk) if(rst)q<=0;else q<=q+1;endmodule"
    }
  ],
  "inputs": [
    {
      "name": "rst",
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

Resposta: Após o primeiro avanço com rst=1, q=0000. Com rst=0, o próximo avanço
de 10 ns mostra q=0001. Após Reiniciar, as saídas voltam a x até uma nova
execução.
