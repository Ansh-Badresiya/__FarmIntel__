// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Government Orange palette
        gov: {
          orange:     '#E8500A',
          'orange-dark': '#C44008',
          'orange-light': '#FFF0EA',
          navy:       '#1A3A5C',
          'navy-dark': '#0F2540',
          'navy-light': '#E8EFF7',
          gold:       '#C9962A',
          'bg':       '#F4F4F4',
          'border':   '#CCCCCC',
          'text':     '#1A1A2E',
          'text-light': '#555566',
        },
        // Status colors
        status: {
          approved:  '#1A7A1A',
          rejected:  '#C0392B',
          pending:   '#E8500A',
          review:    '#1A5C9C',
          expired:   '#777788',
        },
      },
      borderRadius: {
        DEFAULT: '2px',
        'sm':    '2px',
        'md':    '4px',
        'lg':    '4px',
        'xl':    '4px',
        '2xl':   '4px',
        'full':  '9999px',
      },
      boxShadow: {
        'gov': '0 1px 3px rgba(0,0,0,0.12)',
        'gov-md': '0 2px 6px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
