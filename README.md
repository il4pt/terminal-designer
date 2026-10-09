<div align="center">

<img src="assets/icon.png" width="96" alt="Terminal Designer icon">

# Terminal Designer

**Design your Linux terminal visually — no manual config editing needed.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

Terminal Designer is a visual configuration editor for the **fish** shell and **fastfetch**. Tweak settings with real-time preview, customize your prompts and colors, and apply the configuration to your system with one click.

## Features

- **Logo:** Type ASCII art, load `.txt`, drag-and-drop PNG/JPG images, choose built-in distro logos, or hide the logo.
- **System Information:** Add, remove, drag-to-reorder, rename, custom color each field, and insert custom text rows.
- **Colors & Themes:** 6 presets (Catppuccin, Gruvbox, Nord, Tokyo Night, Dracula, and Default) + 8-color ANSI palette customization.
- **Window Styling:** Background opacity, blur, font size, and window padding.
- **fish Prompt:** Customize `user@host`, current path, and prompt symbol colors.
- **One-Click Apply:** Automatically writes configs to the proper paths; existing files are safely backed up with `.bak`.
- **Portable & Shareable:** Export configurations as `.json` or generate a standalone `install.sh` script for other machines.
- **Multi-language:** English and Turkish interface support.

## Supported Terminals

| Terminal | Colors | Opacity / Blur | Image Logo |
|---|---|---|---|
| **Konsole** | ✅ (Profile configured automatically) | ✅ | ✅ |
| **kitty** | ✅ | ✅ | ✅ |
| **Alacritty** | ✅ (Copy config manually) | ✅ | ❌ |

## Installation

### Prebuilt Packages

Download prebuilt binaries from the [Releases](https://github.com/il4pt/terminal-designer/releases) page:

```bash
# AppImage
chmod +x terminal-designer-*.AppImage
./terminal-designer-*.AppImage

# Arch Linux / CachyOS
sudo pacman -U terminal-designer-*.pacman
```

> **Note:** If AppImage requires FUSE on your system: install `fuse2` (`sudo pacman -S fuse2` or `sudo apt install libfuse2`) or run with `APPIMAGE_EXTRACT_AND_RUN=1 ./terminal-designer-*.AppImage`.

### From Source

```bash
git clone https://github.com/il4pt/terminal-designer.git
cd terminal-designer
npm install
npm start
```

**Requirements:** `fish`, `fastfetch`, and Node.js 20+ (only when running from source).

## Files Modified

The application only writes inside these folders, and every existing file is backed up as `.bak` first:

```
~/.config/fastfetch/          config.jsonc, logo.txt / logo.png
~/.config/fish/functions/     fish_prompt.fish, fish_greeting.fish
~/.config/kitty/              terminal-designer.conf (+ include line in kitty.conf)
~/.local/share/konsole/       TerminalDesigner.colorscheme, default profile
~/.config/konsolerc           (only if no default Konsole profile exists)
```

To rollback any changes, simply restore the `.bak` files.

## Building Packages

```bash
npm run dist     # Generates AppImage, .pacman, and .deb packages in dist/
```

---

## License

[MIT](LICENSE) © [il4pt](https://github.com/il4pt)
