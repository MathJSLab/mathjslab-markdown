library ieee;
use ieee.std_logic_1164.all;
use std.env.all;

entity browser_delays is end;
architecture test of browser_delays is
  signal source, inertial_value, transport_value : std_logic := '0';
begin
  inertial_value <= source after 4 ns;
  transport_value <= transport source after 4 ns;
  process
  begin
    wait for 10 ns;
    source <= '1';
    wait for 2 ns;
    source <= '0';
    wait for 3 ns;
    assert inertial_value = '0' and transport_value = '1'
      report "inertial rejection or transport scheduling failed" severity failure;
    wait for 2 ns;
    assert inertial_value = '0' and transport_value = '0'
      report "transport falling transaction missing" severity failure;
    report "delay transactions checkpoint" severity note;
    stop;
    wait;
  end process;
end;
