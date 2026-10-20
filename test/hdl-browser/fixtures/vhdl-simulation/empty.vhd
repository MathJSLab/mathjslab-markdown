use std.env.all;
entity browser_empty is end;
architecture test of browser_empty is
begin
  process
    variable counter : integer := 0;
  begin
    for i in 1 to 7 loop
      wait for 19 ns;
      counter := counter + 1;
    end loop;
    assert counter = 7 severity failure;
    report "empty recording checkpoint at 133 ns" severity note;
    stop;
    wait;
  end process;
end;
