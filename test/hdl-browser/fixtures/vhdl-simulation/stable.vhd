library ieee;
use ieee.std_logic_1164.all;
use std.env.all;

entity browser_stable is end;
architecture test of browser_stable is
  signal steady : std_logic := '1';
begin
  process
  begin
    wait for 137 ns;
    assert steady = '1' report "stable value changed" severity failure;
    report "stable recording checkpoint at 137 ns" severity note;
    stop;
    wait;
  end process;
end;
