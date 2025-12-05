import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed button-apple transition-apple'
  
  const variantStyles = {
    primary: 'bg-apple-blue text-white hover:bg-[#0051D5] active:bg-[#0040AA] shadow-apple hover:shadow-apple-lg',
    secondary: 'bg-apple-gray-2 text-apple-gray-7 hover:bg-apple-gray-3 active:bg-apple-gray-3',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-apple hover:shadow-apple-lg',
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

