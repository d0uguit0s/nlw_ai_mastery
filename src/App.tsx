import { ThemeProvider } from "@/components/theme-provider"
import { Button } from './components/ui/button'
import { ModeToggle } from './components/mode-toggle'

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Button>Teste</Button>
      <ModeToggle/>
    </ThemeProvider>
  )
}
