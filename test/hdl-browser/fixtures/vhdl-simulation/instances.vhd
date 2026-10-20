library ieee;
use ieee.std_logic_1164.all;
entity browser_and is port(a,b:in std_logic; y:out std_logic); end;
architecture rtl of browser_and is begin y <= a and b; end;

library ieee;
use ieee.std_logic_1164.all;
use std.env.all;
entity browser_instances is end;
architecture test of browser_instances is
  signal a,b,y : std_logic := '0';
begin
  dut: entity work.browser_and port map(a,b,y);
  process
  begin
    wait for 1 ns;
    assert y = '0' severity failure;
    a <= '1'; b <= '1';
    wait for 1 ns;
    assert y = '1' severity failure;
    report "instance checkpoint" severity note;
    stop;
    wait;
  end process;
end;
