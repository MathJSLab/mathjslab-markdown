library ieee;
use ieee.std_logic_1164.all;
use std.env.all;

entity browser_delta_pulse is end;
architecture test of browser_delta_pulse is
  signal pulse : std_logic := '0';
begin
  process
  begin
    wait for 10 ns;
    pulse <= '1'; wait for 0 ns;
    assert pulse = '1' and pulse'event severity failure;
    pulse <= '0'; wait for 0 ns;
    assert pulse = '0' and pulse'event severity failure;
    pulse <= '1'; wait for 0 ns;
    assert pulse = '1' and pulse'event severity failure;
    pulse <= '0'; wait for 1 ns;
    assert pulse = '0' severity failure;
    report "delta pulse checkpoint" severity note;
    stop;
    wait;
  end process;
end;
