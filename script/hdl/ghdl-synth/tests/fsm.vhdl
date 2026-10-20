library ieee; use ieee.std_logic_1164.all;
entity fsm is port(clk,rst,start: in std_logic; active: out std_logic); end;
architecture rtl of fsm is type state_type is (idle,running); signal state: state_type; begin
process(clk) begin if rising_edge(clk) then if rst='1' then state <= idle; else case state is when idle => if start='1' then state <= running; end if; when running => if start='0' then state <= idle; end if; end case; end if; end if; end process;
active <= '1' when state = running else '0'; end;
