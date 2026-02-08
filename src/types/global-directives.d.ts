// src/types/global-directives.d.ts
import type {Directive} from 'vue'

declare module 'vue' {
  export interface GlobalDirectives {
    permission: Directive<HTMLElement, string | string[]>
    role: Directive<HTMLElement, string | string[]>
  }
}