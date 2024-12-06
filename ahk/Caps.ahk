#Requires AutoHotkey v2.0
SetCapsLockState("AlwaysOff")
DetectHiddenWindows True

FileCreateShortcut A_ScriptFullPath, A_Startup "\startAHK.lnk"

; 创建一个托盘图标
TraySetIcon("./Sunrise.ico")
A_IconTip := "河童小生的AHK脚本"

isEnglishMode() {
    ; 判断是否为英文模式
    try {
        hWnd := WinGetID("A")
    } catch Error {
        ; ^Esc 开始菜单弹窗，卡死在找不到当前窗口
        return
    }
    result := SendMessage(
        0x283,          ; Message : WM_IME_CONTROL
        0x001,          ; wParam  : IMC_GETCONVERSIONMODE
        0,              ; lParam  ： (NoArgs)
        ,               ; Control ： (Window)
        ; 获取当前输入法的模式
        "ahk_id " DllCall("imm32\ImmGetDefaultIMEWnd", "Uint", hWnd, "Uint")
    )
    ; 其他    0-1
    return (Mod(result, 2) = 0)
}

setIME(setSts, win_id := "") { ; 设置输入法状态-获取状态-末位设置
    ErrorLevel := SendMessage(0x283, 0x001, 0, , "ahk_id" win_id, , , , 1000)
    CONVERSIONMODE := 2046 & ErrorLevel, CONVERSIONMODE += setSts
    ErrorLevel := SendMessage(0x283, 0x002, CONVERSIONMODE, , "ahk_id" win_id, , , , 1000)
    ErrorLevel := SendMessage(0x283, 0x006, setSts, , "ahk_id" win_id, , , , 1000)
    return ErrorLevel
}

getIMEwinid() { ; 获取激活窗口IME线程id
    if WinActive("ahk_class ConsoleWindowClass") {
        win_id := WinGetID("ahk_exe conhost.exe")
    } else if WinActive("ahk_group focus_control_ahk_group") {
        CClassNN := ControlGetFocus("A")
        if (CClassNN = "")
            win_id := WinGetID("A")
        else
            win_id := ControlGetHwnd(CClassNN)
    } else
        win_id := WinGetID("A")
    IMEwin_id := DllCall("imm32\ImmGetDefaultIMEWnd", "Uint", win_id, "Uint")
    return IMEwin_id
}

getCurrentIMEID() {
    ; 获取当前窗口使用IME的ID
    winID := WinGetID("A")
    ThreadID := DllCall("GetWindowThreadProcessId", "uint", winID, 0)
    InuptLocalID := DllCall("GetKeyboardLayout", "uint", ThreadID, "uint")
    return InuptLocalID
}

$CapsLock::
{
    ; 切换中英文输入
    gl_Active_IME_winID := getIMEwinid()
    if (isEnglishMode()) {
        setIME(0, gl_Active_IME_winID)
    } else {
        setIME(1, gl_Active_IME_winID)
    }
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
