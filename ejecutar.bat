@echo off
chcp 65001 >nul
title Rally Estudiantil 2.0
cd /d "%~dp0"

where php >nul 2>&1
if errorlevel 1 (
    echo PHP no está en el PATH. Instala XAMPP, WAMP o PHP y añade php.exe al PATH.
    pause
    exit /b 1
)

echo Iniciando servidor en http://localhost:8080
echo Abre el navegador en: http://localhost:8080
echo.
echo Para detener: Ctrl+C
echo.
start "" "http://localhost:8080"
php -S localhost:8080 -t "%~dp0"
