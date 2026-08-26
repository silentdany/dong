import { themeCssVars } from '@config/theme'

/** Publishes theme.ts tokens as CSS custom properties. The only bridge to CSS. */
export default function ThemeStyle() {
  return <style dangerouslySetInnerHTML={{ __html: themeCssVars() }} />
}
