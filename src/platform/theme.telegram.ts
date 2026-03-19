export function applyTelegramTheme() {
  const tp = window.Telegram!.WebApp.themeParams
  const root = document.documentElement.style

  if (tp.text_color) root.setProperty('--text', tp.text_color)
  if (tp.text_color) root.setProperty('--text-h', tp.text_color)
  if (tp.bg_color) root.setProperty('--bg', tp.bg_color)
  if (tp.secondary_bg_color)
    root.setProperty('--card-bg', tp.secondary_bg_color)
  if (tp.secondary_bg_color)
    root.setProperty('--slot-bg', tp.secondary_bg_color)
  if (tp.hint_color) root.setProperty('--slot-border', tp.hint_color)
  if (tp.button_color) {
    root.setProperty('--accent', tp.button_color)
    root.setProperty('--accent-hover', tp.button_color)
    root.setProperty('--slot-active-border', tp.button_color)
  }
  if (tp.section_bg_color)
    root.setProperty('--slot-active', tp.section_bg_color)

  root.setProperty('--shadow', 'none')
}
