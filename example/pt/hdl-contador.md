# HDL: simulação de um contador síncrono

Requisitos de execução: executor HDL autorizado pelo aplicativo e serviço com
GHDL (VHDL), Icarus/VVP (simulação Verilog) e Yosys (síntese). No mathjslab-app
0.6.0, a execução em produção está desabilitada; em desenvolvimento é preciso
configurar o serviço loopback, o token e as opções do aplicativo em
sessionStorage["mathjslab.hdl.backend"] e recarregar a página. O Markdown não
pode autorizar a execução. Uma listagem do código não é um resultado de
simulação.

Requer um executor HDL fornecido e autorizado pelo aplicativo. O engine não
inclui compilador ou simulador. O aplicativo converte a saída da simulação para
WaveJSON ou a síntese para JSON do Yosys; as ferramentas e otimizações
escolhidas podem produzir representações diferentes.

## VHDL

```vhdl-run {width=75%}
{
  "operation": "simulate",
  "top": "tb",
  "standard": "08",
  "files": [
    {
      "name": "counter.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all; use ieee.numeric_std.all;\nentity counter is port(clk,rst: in std_logic; q: out std_logic_vector(3 downto 0)); end;\narchitecture rtl of counter is\n signal value: unsigned(3 downto 0) := (others => '0');\nbegin\n q <= std_logic_vector(value);\n process(clk) begin\n  if rising_edge(clk) then\n   if rst = '1' then value <= (others => '0'); else value <= value + 1; end if;\n  end if;\n end process;\nend;\n"
    },
    {
      "name": "tb.vhd",
      "source": "library ieee; use ieee.std_logic_1164.all;\nentity tb is end;\narchitecture test of tb is\n signal clk: std_logic := '0'; signal rst: std_logic := '1';\n signal q: std_logic_vector(3 downto 0);\nbegin\n clk <= not clk after 5 ns;\n dut: entity work.counter port map(clk,rst,q);\n process begin\n  wait for 12 ns; rst <= '0'; wait for 14 ns;\n  assert q = \"0010\" severity failure; wait;\n end process;\nend;\n"
    }
  ],
  "stopTimeNs": 100
}
```

## Verilog / SystemVerilog

```verilog-run {width=75%}
{
  "operation": "simulate",
  "top": "tb",
  "standard": "2012",
  "files": [
    {
      "name": "counter.v",
      "source": "module counter(input clk, rst, output reg [3:0] q);\nalways @(posedge clk)\n if (rst) q <= 0; else q <= q + 1;\nendmodule\n"
    },
    {
      "name": "tb.sv",
      "source": "module tb;\nreg clk=0, rst=1; wire [3:0] q;\ncounter dut(clk,rst,q);\nalways #5 clk=~clk;\ninitial begin\n #12 rst=0; #14; if (q !== 2) $fatal(1, \"counter\");\n #54; $finish;\nend\nendmodule\n"
    }
  ],
  "stopTimeNs": 100
}
```

## Atividade

O reset é síncrono ou assíncrono?

Resposta: Síncrono: a mudança ocorre na borda de subida do clock.
