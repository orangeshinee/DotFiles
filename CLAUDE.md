# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal dotfiles repository containing various configuration files and scripts for development tools, including:

- **tempermonkey/**: User scripts for browser automation
  - `CopyAsMarkdown.js`: Tampermonkey script to copy webpage URLs as markdown links
- **ahk/**: AutoHotkey scripts for Windows automation
- **picgo/**: Image upload configuration files
- **starship/**: Starship prompt configuration
- **obsidian/**: Obsidian notes and templates
- **scripts/**: Batch and shell scripts for various tasks

## Key Configuration Files

### Tampermonkey Scripts
- **CopyAsMarkdown.js**: Enhanced version 2.1 with security fixes and improved features
  - Security: HTML escaping for XSS prevention
  - Features: Customizable shortcuts (Ctrl/Alt/Shift combinations), configuration management
  - Error handling: Detailed error messages for clipboard operations
  - Performance: DOM caching and WeakMap-based element management

### AutoHotkey Scripts
- **Caps.ahk**: Caps Lock key remapping
- **ChangeVoice.ahk**: Voice/IME switching automation
- Check `ahk/README.md` for usage details

### Image Upload
- **picgo-core.json**: PicGo configuration for image upload
- **piclist-config.json**: Alternative configuration for PicList

### Shell Scripts
- **upload_clipboard_img.bat**: Windows batch script for clipboard image upload
- **upload_clipboard_img.sh**: Unix shell script for clipboard image upload

## Development Commands

### AutoHotkey Scripts
```bash
# Run AutoHotkey scripts
AutoHotkey.exe ahk\Caps.ahk
AutoHotkey.exe ahk\ChangeVoice.ahk
```

### Tampermonkey Development
- Install as user script in browser
- Test on various websites for compatibility
- Use browser dev tools for debugging

### Image Upload Testing
```bash
# Test image upload scripts
scripts\upload_clipboard_img.bat  # Windows
scripts\upload_clipboard_img.sh   # Unix/Linux
```

## File Structure Conventions

- **tempermonkey/**: Browser user scripts (Tampermonkey/Greasemonkey compatible)
- **ahk/**: Windows automation scripts
- **obsidian/**: Note-taking templates and configurations
- **scripts/**: Cross-platform utility scripts
- **config files**: Various tool configurations (starship, picgo, etc.)

## Security Considerations

- All user scripts include XSS prevention measures
- No sensitive data is stored in configuration files
- Scripts are intended for personal use only