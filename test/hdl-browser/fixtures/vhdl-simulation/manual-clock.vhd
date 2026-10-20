library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;
entity manual_counter is port(clk,rst:in std_logic;q:out std_logic_vector(2 downto 0));end;
architecture rtl of manual_counter is signal n:unsigned(2 downto 0):=(others=>'0');begin q<=std_logic_vector(n);process(clk)begin if rising_edge(clk)then if rst='1'then n<=(others=>'0');else n<=n+3;end if;end if;end process;end;
library ieee;use ieee.std_logic_1164.all;
entity browser_manual is end;architecture test of browser_manual is signal clk,rst:std_logic;signal q:std_logic_vector(2 downto 0);begin
dut:entity work.manual_counter port map(clk=>clk,rst=>rst,q=>q);
process begin clk<='0';rst<='1';wait for 5 ns;clk<='1';wait for 5 ns;clk<='0';rst<='0';wait for 5 ns;clk<='1';wait for 5 ns;assert q="011" severity failure;report "manual clock checkpoint";std.env.stop;wait;end process;end;
