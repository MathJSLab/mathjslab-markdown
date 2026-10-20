library ieee; use ieee.std_logic_1164.all; use ieee.numeric_std.all;
entity adder8 is port(a,b: in unsigned(7 downto 0); y: out unsigned(7 downto 0)); end;
architecture rtl of adder8 is begin y <= a + b; end;
