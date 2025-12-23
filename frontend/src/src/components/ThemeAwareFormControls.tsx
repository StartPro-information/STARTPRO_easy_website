import React, { forwardRef } from 'react'

const merge = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ')

const baseInputClass =
  'w-full px-4 py-2 rounded-lg border bg-theme-surface text-theme-text placeholder:text-theme-textMuted border-theme-border focus:ring-2 focus:ring-theme-accent focus:border-transparent transition-colors'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const ThemeAwareInput = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} className={merge(baseInputClass, className)} {...props} />
})
ThemeAwareInput.displayName = 'ThemeAwareInput'

export const ThemeAwareTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={merge(baseInputClass, 'min-h-[120px]', className)} {...props} />
})
ThemeAwareTextarea.displayName = 'ThemeAwareTextarea'

export const ThemeAwareSelect = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <select ref={ref} className={merge(baseInputClass, 'appearance-none cursor-pointer', className)} {...props}>
      {children}
    </select>
  )
})
ThemeAwareSelect.displayName = 'ThemeAwareSelect'
