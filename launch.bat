@echo off
title Bot Manager Pro - Запуск
echo ========================================
echo    Bot Manager Pro v2.0
echo    Профессиональная система управления
echo ========================================
echo.
echo Запуск приложения...
echo.

REM Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ОШИБКА: Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org
    pause
    exit /b 1
)

REM Проверяем наличие package.json
if not exist package.json (
    echo ОШИБКА: Файл package.json не найден!
    echo Убедитесь, что вы находитесь в правильной папке
    pause
    exit /b 1
)

REM Устанавливаем зависимости если нужно
if not exist node_modules (
    echo Установка зависимостей...
    npm install
    if %errorlevel% neq 0 (
        echo ОШИБКА: Не удалось установить зависимости!
        pause
        exit /b 1
    )
)

REM Запускаем приложение
echo Запуск Bot Manager Pro...
echo.
echo Приложение будет доступно по адресу: http://localhost:5173
echo.
echo Для остановки нажмите Ctrl+C
echo.

npm run dev

pause