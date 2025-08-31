// Simple shader hot reload in dev: re-import modules on Vite HMR update.
export function shaderHotReload(importPath: string, onUpdate: (src: string) => void) {
  if (import.meta.hot) {
    import.meta.hot.accept(importPath, (mod: any) => {
      const src = (mod?.default || '') as string;
      onUpdate(src);
    });
  }
}