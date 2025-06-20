@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 设置日志路径
set SCRIPT_DIR=%~dp0
set PARENT_DIR=%SCRIPT_DIR:~0,-1%
for %%i in ("%PARENT_DIR%") do set "LOG_DIR=%%~dpi\log"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LOG_FILE=%LOG_DIR%\upload.log

echo [%date% %time%] 开始上传 >> "%LOG_FILE%"

:: 用 PowerShell 调用 picgo，获取完整输出
powershell -ExecutionPolicy Bypass -command "New-BurntToastNotification -Text 'PicGo', 'PicGo 开始上传'"
for /f "usebackq delims=" %%i in (`powershell -ExecutionPolicy Bypass -command "picgo u 2>&1"`) do (
    echo %%i >> "%LOG_FILE%"
    set "line=%%i"
    echo %%i | findstr /r "^https*://" >nul
    if !errorlevel! == 0 (
        set "URL=%%i"
    )
)

:: 判断是否成功
if defined URL (
    echo [%date% %time%] 上传成功：!URL! >> "%LOG_FILE%"
    echo !URL! | clip
    powershell -ExecutionPolicy Bypass -command "New-BurntToastNotification -Text 'PicGo 上传成功', '!URL!'"
    echo !URL!
) else (
    echo [%date% %time%] 上传失败或剪贴板无图片 >> "%LOG_FILE%"
    powershell -ExecutionPolicy Bypass -command "New-BurntToastNotification -Text 'PicGo 上传失败', '请确认剪贴板中有图片'"
)

endlocal
