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
  shortcuts: [
    ['sub-title', 'text-[#fff]/65 text-[14px] font-400 mb-[8px] mt-[8px]'],
    ['frame', 'pb-[16px] border-b-solid border-[1px] border-[#35363B]'],
  ],
})
