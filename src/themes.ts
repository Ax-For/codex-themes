export type ThemeId = 'native' | 'xp-qq'

export type ThemeDefinition = {
  id: ThemeId
  label: string
  description: string
  shell: 'native' | 'retro'
  swatchClass: string
}

export const DEFAULT_THEME: ThemeId = 'xp-qq'
export const THEME_STORAGE_KEY = 'codex-theme'

export const themeRegistry: ThemeDefinition[] = [
  {
    id: 'native',
    label: '原生 Codex',
    description: '现代、安静的默认工作区',
    shell: 'native',
    swatchClass: 'swatch-native',
  },
  {
    id: 'xp-qq',
    label: 'Windows XP · QQ',
    description: 'Windows XP 时代的 QQ 窗口',
    shell: 'retro',
    swatchClass: 'swatch-xp',
  },
]

export function isThemeId(value: string | null): value is ThemeId {
  return themeRegistry.some((theme) => theme.id === value)
}
