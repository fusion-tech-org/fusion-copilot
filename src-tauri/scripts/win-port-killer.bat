@ECHO OFF 
cls      
:loop
cls
:enterPort
cls
set /P port="Enter a port. [ q => exit ] : " 
If "%port%"=="q"  goto endLoop 
cls
echo.
echo.
echo List of Process that contains the "%port%" string . find the process that you want.
echo.
netstat -aon | findstr i
echo.
netstat -aon | findstr %port%  
echo.
echo. -------------------------
echo.
echo (*the last number is process id.)
echo.
set /P processId="Enter Process id to kill. [ b => back , q => exit ] : " 
If "%processId%"=="b"  goto enterPort   
If "%processId%"=="q"  goto endLoop                                                                
taskkill /F /PID %ProcessId%

goto loop

:endLoop
cls