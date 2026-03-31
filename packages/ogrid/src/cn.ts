import { twMerge } from 'tailwind-merge'
const cn = (...inputs: (false | null | string | undefined)[]) => twMerge(inputs.filter(Boolean).join(' '))
export { cn }
