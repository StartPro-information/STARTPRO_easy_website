export interface ComponentRenderFn {
  (component: any): string | null
}

export type RenderMap = Record<string, ComponentRenderFn>
