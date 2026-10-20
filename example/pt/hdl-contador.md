# HDL: simulação de um contador síncrono

Execução no cliente: o aplicativo deve autorizar createBrowserHDLExecutor e
hospedar seus assets WebAssembly/Worker. Verilog usa Icarus e YoWASP no
navegador, sem serviço, token ou sessionStorage. Síntese VHDL-2008 usa GHDL e YoWASP
no navegador; simulação e interatividade VHDL-2008 usam o runtime NVC. O
Markdown não pode autorizar execução. Consulte
doc/extensions/hdl-troubleshooting.md e doc/hdl-browser-results.md.

O executor retorna VCD para inspeção e JSON do Yosys para netlists. As
ferramentas e otimizações podem produzir representações diferentes.

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
