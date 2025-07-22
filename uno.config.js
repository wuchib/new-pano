import { defineConfig, presetUno } from 'unocss'
import { presetIcons } from 'unocss/preset-icons'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
