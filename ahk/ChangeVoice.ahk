#Requires AutoHotkey v2.0
#SingleInstance Force

; 设置触发区域高度（可根据需要调整）
triggerZoneHeight := 30

; 滚轮调节音量的步进值（1-100）
volumeStep := 2

; 主循环检测鼠标位置
SetTimer(CheckMousePosition, 50)

; 创建GUI用于美观的音量显示
volumeDisplay := Gui("+ToolWindow -Caption +AlwaysOnTop")
volumeDisplay.BackColor := "333333"  ; 深灰色背景
volumeDisplay.SetFont("s16 cWhite", "Segoe UI")  ; 白色文字
volumeText := volumeDisplay.Add("Text", "w100 h30 Center", "音量: 50%")
volumeDisplay.MarginX := 10
volumeDisplay.MarginY := 10

CheckMousePosition() {
    ; 获取鼠标当前位置和屏幕尺寸
    MouseGetPos(&mouseX, &mouseY)
    screenWidth := A_ScreenWidth
    screenHeight := A_ScreenHeight
    
    ; 检查鼠标是否在屏幕顶部或底部区域
    static isInTriggerZone := false
    if ((mouseY >= 0 && mouseY <= triggerZoneHeight && mouseX >= 0 && mouseX <= screenWidth) || 
        (mouseY >= screenHeight - triggerZoneHeight && mouseY <= screenHeight && mouseX >= 0 && mouseX <= screenWidth)) {
        if (!isInTriggerZone) {
            isInTriggerZone := true
        }
    } else {
        if (isInTriggerZone) {
            isInTriggerZone := false
        }
    }
}

; 滚轮向上 - 增加音量
WheelUp:: {
    if (IsMouseInTriggerZone()) {
        AdjustVolume(volumeStep)
    } else {
        Send("{WheelUp}")
    }
}

; 滚轮向下 - 降低音量
WheelDown:: {
    if (IsMouseInTriggerZone()) {
        AdjustVolume(-volumeStep)
    } else {
        Send("{WheelDown}")
    }
}

; 检查鼠标是否在触发区域
IsMouseInTriggerZone() {
    MouseGetPos(&mouseX, &mouseY)
    screenHeight := A_ScreenHeight
    return (mouseY >= 0 && mouseY <= triggerZoneHeight && mouseX >= 0 && mouseX <= A_ScreenWidth) || 
           (mouseY >= screenHeight - triggerZoneHeight && mouseY <= screenHeight && mouseX >= 0 && mouseX <= A_ScreenWidth)
}

; 调节音量函数
AdjustVolume(step) {
    ; 获取当前音量
    currentVolume := SoundGetVolume()
    
    ; 计算新音量并四舍五入为整数
    newVolume := Round(currentVolume + step)
    newVolume := Min(Max(newVolume, 0), 100)  ; 限制在0-100范围内
    
    ; 设置新音量
    SoundSetVolume(newVolume)
    
    ; 显示美化音量提示
    ShowVolumeOSD(newVolume)
}

; 显示美化音量提示（1秒后直接消失）
ShowVolumeOSD(volume) {
    ; 取消之前的隐藏计时器
    try SetTimer(, -0)
    
    ; 更新GUI内容
    volumeText.Text := "音量: " Round(volume) "%"
    
    ; 计算显示位置（屏幕右侧下方1/3处）
    screenWidth := A_ScreenWidth
    screenHeight := A_ScreenHeight
    posX := screenWidth - 180  ; 留出180-150像素宽度空格
    posY := screenHeight * 2 // 3  ; 下方1/3处
    
    ; 显示GUI
    volumeDisplay.Show("x" posX " y" posY " NoActivate")
    
    ; 1秒后直接隐藏
    SetTimer(() => volumeDisplay.Hide(), -1000)
}