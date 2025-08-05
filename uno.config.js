import { defineConfig, presetUno } from 'unocss'
import { presetIcons } from 'unocss/preset-icons'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({  //图标
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
    ['navbar-group-item', 'inline-flex w-[108px] h-[32px] rounded-[4px] items-center gap-[4px] justify-center cursor-pointer duration-300 vertical-top text-[#fff]/65'],
    ['navbar-scene-item','w-[210px] h-[118px] inline-flex justify-center items-center duration-300 vertical-top']
  ],
})
