interface TelegramWebApp {
  initData: string
  ready(): void
  expand(): void
  close(): void
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    header_bg_color?: string
    section_bg_color?: string
    accent_text_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
  }
  colorScheme: 'light' | 'dark'
  onEvent(event: string, callback: () => void): void
  offEvent(event: string, callback: () => void): void
  CloudStorage: {
    getItem(
      key: string,
      callback: (error: string | null, value?: string) => void,
    ): void
    setItem(
      key: string,
      value: string,
      callback?: (error: string | null, success?: boolean) => void,
    ): void
    removeItem(
      key: string,
      callback?: (error: string | null, success?: boolean) => void,
    ): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void
    selectionChanged(): void
  }
}

interface Telegram {
  WebApp: TelegramWebApp
}

interface Window {
  Telegram?: Telegram
}
