#Requires AutoHotkey v2.0
SetCapsLockState("AlwaysOff")
DetectHiddenWindows True

FileCreateShortcut A_ScriptFullPath, A_Startup "\startAHK.lnk"

; 创建一个托盘图标
TraySetIcon("./Sunrise.ico")
A_IconTip := "河童小生的AHK脚本"

; 导入ChangeVoice脚本功能
#Include ChangeVoice.ahk


; 初始化 CapsLock 状态变量
global LevelError := 0
; CapsLock 热键设置
CapsLock::
{
    global LevelError := KeyWait("CapsLock", "T0.3")
}

CapsLock Up::
{
    global LevelError
    if (LevelError > 0) {
        ; 发送右Shift切换输入法
        Send "^ "
    }
    LevelError := 0
}


;参考https://github.com/Vonng/Capslock/tree/master
;=====================================================================o
;                    CapsLock Direction Navigator
;-----------------------------------o---------------------------------o
;      键\修饰    	✱	     !(+)	      ^         ^!
;        h         ←         选字        跳词      跳选词
;        j         ↓         选字        跳词      跳选词
;        k         ↑         选字        跳词      跳选词
;        l         →         选字        跳词      跳选词
;-----------------------------------o---------------------------------o
CapsLock & h::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
        ; 无 左移一字
            Send "{Left}"
        else
        ; ! 左选一字
            Send "+{Left}"
        return
    }
    else {
        ; ^ 左跳一词
        if GetKeyState("Alt") = 0
            Send "^{Left}"
        else
        ; ^! 左跳选一词
            Send "+^{Left}"
        return
    }
}

CapsLock & j::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
            Send "{Down}"
        else
            Send "+{Down}"
        return
    }
    else {
        if GetKeyState("Alt") = 0
            Send "^{Down}"
        else
            Send "+^{Down}"
        return
    }
}

CapsLock & k::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
            Send "{Up}"
        else
            Send "+{Up}"
        return
    }
    else {
        if GetKeyState("Alt") = 0
            Send "^{Up}"
        else
            Send "+^{Up}"
        return
    }
}

CapsLock & l::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
            Send "{Right}"
        else
            Send "+{Right}"
        return
    }
    else {
        if GetKeyState("Alt") = 0
            Send "^{Right}"
        else
            Send "+^{Right}"
        return
    }
}

;=====================================================================o
;                       CapsLock Switcher:                           ;|
;---------------------------------o-----------------------------------O
;                    CapsLock + ` | {CapsLock}                       ;|
;---------------------------------o-----------------------------------o
CapsLock & `::
{
    CapsLockState := GetKeyState("CapsLock", "T") ? "D" : "U"
    if CapsLockState = "D"
        SetCapsLockState("AlwaysOff")
    else
        SetCapsLockState("AlwaysOn")
    KeyWait("``")
    return
}
;---------------------------------------------------------------------o

;=====================================================================o
;                     CapsLock Home/End Navigator
;-----------------------------------o---------------------------------o
;                      CapsLock + i |  Home
;                      CapsLock + o |  End
;                      Ctrl, Alt Compatible
;-----------------------------------o---------------------------------o
CapsLock & i::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
            Send "{Home}"
        else
            Send "+{Home}"
        return
    }
    else {
        if GetKeyState("Alt") = 0
            Send "^{Home}"
        else
            Send "+^{Home}"
        return
    }
}

CapsLock & o::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
            Send "{End}"
        else
            Send "+{End}"
        return
    }
    else {
        if GetKeyState("Alt") = 0
            Send "^{End}"
        else
            Send "+^{End}"
        return
    }
}

;=====================================================================o
;                      CapsLock Page Navigator
;-----------------------------------o---------------------------------o
;                      CapsLock + u |  PageUp
;                      CapsLock + p |  PageDown
;                      Ctrl, Alt Compatible
;-----------------------------------o---------------------------------o
CapsLock & u::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
            Send "{PgUp}"
        else
            Send "+{PgUp}"
        return
    }
    else {
        if GetKeyState("Alt") = 0
            Send "^{PgUp}"
        else
            Send "+^{PgUp}"
        return
    }
}

CapsLock & p::
{
    if GetKeyState("control") = 0 {
        if GetKeyState("Alt") = 0
            Send "{PgDn}"
        else
            Send "+{PgDn}"
        return
    }
    else {
        if GetKeyState("Alt") = 0
            Send "^{PgDn}"
        else
            Send "+^{PgDn}"
        return
    }
}

logMessage(message) {
    ; 获取当前脚本所在的目录
    scriptDir := A_ScriptDir
    logFile := scriptDir . "\log.log"
    
    ; 获取当前时间
    currentTime := FormatTime("yyyyMMdd HH:mm:ss")
    
    ; 打开日志文件以追加模式
    FileAppend(currentTime " - " message "`n", logFile)
}
