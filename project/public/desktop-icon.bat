@echo off
echo Создание ярлыка Bot Manager Pro на рабочем столе...

set "desktop=%USERPROFILE%\Desktop"
set "shortcut=%desktop%\Bot Manager Pro.url"

echo [InternetShortcut] > "%shortcut%"
echo URL=http://localhost:5173 >> "%shortcut%"
echo IconFile=%~dp0icon.ico >> "%shortcut%"
echo IconIndex=0 >> "%shortcut%"

echo Ярлык создан на рабочем столе!
pause