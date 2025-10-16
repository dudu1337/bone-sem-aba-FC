import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    base: '/',
  }

  if (command !== 'serve') {
    // ATENÇÃO: Altere 'SEU-REPOSITORIO' para o nome exato do seu repositório no GitHub
    config.base = '/bone-sem-aba-FC/'
  }

  return config
})
