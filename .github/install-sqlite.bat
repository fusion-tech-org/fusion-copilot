echo off
echo [ Creatin dir ]
mkdir C:\sqlite
CD /D C:\sqlite

echo [ Downloading sqlite3.zip ]
powershell.exe -Command "Invoke-WebRequest -OutFile sqlite3.zip https://sqlite.org/2023/sqlite-dll-win64-x64-3430100.zip"

echo [ Extracting sqlite3.zip ]
powershell.exe -Command "Expand-Archive -Force 'C:\sqlite\sqlite3.zip' 'C:\sqlite'"

echo [ Prepared for MS Visual Studio 2017 ]
set VC2017COM="C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\VC\Auxiliary\Build\vcvars64.bat"
REM Prepared for GitHub Actions ( @see https://github.com/actions/virtual-environments/blob/master/images/win/Windows2019-Readme.md )
set VC2019ENT="C:\Program Files (x86)\Microsoft Visual Studio\2019\Enterprise\VC\Auxiliary\Build\vcvars64.bat"
IF EXIST %VC2017COM% (
    call %VC2017COM%
) 
IF EXIST %VC2019ENT%  (
    call %VC2019ENT%
)

echo [ Creating sqlite3.lib ]
lib /machine:x64 /def:sqlite3.def /out:sqlite3.lib
set PATH=%PATH%;C:\sqlite

echo [ How to use in PowerShell ]
echo  PS: $env:SQLITE3_LIB_DIR="C:\\sqlite" 
echo  PS: $env:Path +=";C:\\sqlite" 
echo  PS: cargo test -- --nocapture