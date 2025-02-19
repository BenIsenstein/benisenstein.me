import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
    presets: [
        presetUno(),
        presetIcons({
          autoInstall: true,
        }),
    ],
    transformers: [
      transformerDirectives()
    ],
    content: {
      pipeline: {
        include: [
          // the default
          /\.(vue|svelte|[jt]sx|mdx|astro|elm|php|phtml|html)($|\?)/,
          // include js/ts files
          'src/**/*.{js,ts}',
        ],
        // exclude files
        // exclude: []
      },
    },
})