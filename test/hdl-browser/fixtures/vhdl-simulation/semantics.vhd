library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use std.env.all;

-- Executable assertions, not a stored waveform or a substitute simulator.
entity browser_semantics is end;
architecture test of browser_semantics is
  signal clock : std_logic := '0';
  signal reset : std_logic := '1';
  signal count : unsigned(4 downto 0) := (others => '0');
  signal delta_a, delta_b : std_logic := '0';
  signal resolved : std_logic;
  signal resolved_three : std_logic;
  signal drive_a : std_logic := 'Z';
  signal drive_b : std_logic := 'Z';
  signal nine : std_logic := 'U';
  signal saw_event : boolean := false;
begin
  clock <= not clock after 5 ns;
  delta_b <= delta_a;
  resolved <= drive_a;
  resolved <= drive_b;
  resolved_three <= drive_a;
  resolved_three <= drive_b;
  resolved_three <= 'Z';

  process
  begin
    wait on delta_b;
    saw_event <= true;
    wait;
  end process;

  process(clock)
    variable edges : natural := 0;
  begin
    if rising_edge(clock) then
      if reset = '1' then
        edges := 0;
        count <= (others => '0');
      else
        edges := edges + 1;
        count <= count + to_unsigned(edges, count'length);
      end if;
    end if;
  end process;

  process
    variable saved : natural := 7;
  begin
    wait for 6 ns;
    assert count = 0 report "synchronous reset failed" severity failure;
    reset <= '0';
    wait until rising_edge(clock);
    wait for 1 ns;
    assert count = 1 report "first numeric_std count failed" severity failure;
    saved := saved + 2;
    wait until rising_edge(clock);
    wait for 1 ns;
    assert count = 3 and saved = 9
      report "process variables did not persist across wait" severity failure;

    delta_a <= '1';
    assert delta_a = '0' report "signal assignment took effect immediately" severity failure;
    wait for 0 ns;
    assert delta_a = '1' and delta_b = '0'
      report "first delta ordering failed" severity failure;
    wait for 0 ns;
    assert delta_b = '1' and delta_b'event
      report "second delta/event failed" severity failure;

    drive_a <= '0'; drive_b <= '1';
    wait for 1 ns;
    assert resolved = 'X' report "multiple-driver resolution failed: " & std_logic'image(resolved) severity failure;
    assert resolved_three = 'X' report "three-driver resolution failed" severity failure;
    assert saw_event report "wait on did not resume" severity failure;
    drive_a <= 'Z'; drive_b <= 'H';
    wait for 1 ns;
    assert resolved = 'H' report "weak-high resolution failed" severity failure;
    assert resolved_three = 'H' report "three-driver weak-high resolution failed" severity failure;
    drive_b <= 'L';
    wait for 1 ns;
    assert resolved = 'L' report "weak-low resolution failed" severity failure;
    for value in std_logic loop
      nine <= value;
      wait for 1 ns;
      assert nine = value report "std_logic value lost inside runtime" severity failure;
    end loop;
    reset <= '1';
    wait until rising_edge(clock);
    wait for 1 ns;
    assert count = 0 report "later reset did not clear state" severity failure;
    reset <= '0';
    wait until rising_edge(clock);
    wait for 1 ns;
    assert count = 1 report "later reset did not clear persistent variable" severity failure;
    report "browser semantics checkpoint" severity note;
    stop;
    wait;
  end process;
end;
