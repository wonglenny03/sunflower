'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTranslation } from '@/lib/i18n/useTranslation'

const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth, isAuthenticated, token } = useAuthStore()
  const { t } = useTranslation()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && token) {
      router.push('/search')
    }
  }, [isAuthenticated, token, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true)
      setError('')
      const { confirmPassword, ...registerData } = data
      const response = await authApi.register(registerData)
      setAuth(response.user, response.accessToken)
      router.push('/search')
      router.refresh()
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your input and try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap px-6 sm:px-10 py-4">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="size-6">
              <svg
                className="text-primary"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6_535)">
                  <path
                    clipRule="evenodd"
                    d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_535">
                    <rect fill="white" height="48" width="48"></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              {t('auth.brand.name')}
            </h2>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 justify-center py-10 px-4">
          <div className="flex w-full max-w-md flex-col items-center">
            {/* Title Section */}
            <div className="flex w-full flex-col gap-3 text-center mb-8">
              <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em]">
                {t('auth.register.title')}
              </p>
              <p className="text-slate-500 text-base font-normal leading-normal">
                {t('auth.register.subtitle')}
              </p>
            </div>

            {/* Form Card */}
            <div className="w-full rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <label className="flex flex-col gap-2">
                  <p className="text-slate-900 text-sm font-medium leading-normal">
                    {t('auth.register.email')}
                  </p>
                  <div className="relative flex w-full flex-1 items-center">
                    <span
                      className="material-symbols-outlined absolute left-4 text-slate-400"
                      style={{ fontSize: '20px' }}
                    >
                      mail
                    </span>
                    <input
                      {...register('email')}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-white focus:border-primary h-12 placeholder:text-slate-400 pl-11 pr-4 text-base font-normal leading-normal"
                      placeholder="you@company.com"
                      type="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs font-normal">{errors.email.message}</p>
                  )}
                </label>

                {/* Username Field */}
                <label className="flex flex-col gap-2">
                  <p className="text-slate-900 text-sm font-medium leading-normal">
                    {t('auth.register.username')}
                  </p>
                  <div className="relative flex w-full flex-1 items-center">
                    <span
                      className="material-symbols-outlined absolute left-4 text-slate-400"
                      style={{ fontSize: '20px' }}
                    >
                      person
                    </span>
                    <input
                      {...register('username')}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-white focus:border-primary h-12 placeholder:text-slate-400 pl-11 pr-4 text-base font-normal leading-normal"
                      placeholder={t('auth.register.username')}
                      type="text"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs font-normal">{errors.username.message}</p>
                  )}
                </label>

                {/* Password Field */}
                <label className="flex flex-col gap-2">
                  <p className="text-slate-900 text-sm font-medium leading-normal">
                    {t('auth.register.password')}
                  </p>
                  <div className="relative flex w-full flex-1 items-center">
                    <span
                      className="material-symbols-outlined absolute left-4 text-slate-400"
                      style={{ fontSize: '20px' }}
                    >
                      lock
                    </span>
                    <input
                      {...register('password')}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-white focus:border-primary h-12 placeholder:text-slate-400 pl-11 pr-11 text-base font-normal leading-normal"
                      placeholder={t('auth.register.password')}
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      className="absolute right-0 h-full px-4 text-slate-400 hover:text-slate-600"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs font-normal">
                    {t('auth.register.passwordHint')}
                  </p>
                  {errors.password && (
                    <p className="text-red-500 text-xs font-normal">{errors.password.message}</p>
                  )}
                </label>

                {/* Confirm Password Field */}
                <label className="flex flex-col gap-2">
                  <p className="text-slate-900 text-sm font-medium leading-normal">
                    {t('auth.register.confirmPassword')}
                  </p>
                  <div className="relative flex w-full flex-1 items-center">
                    <span
                      className="material-symbols-outlined absolute left-4 text-slate-400"
                      style={{ fontSize: '20px' }}
                    >
                      lock
                    </span>
                    <input
                      {...register('confirmPassword')}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-white focus:border-primary h-12 placeholder:text-slate-400 pl-11 pr-11 text-base font-normal leading-normal"
                      placeholder={t('auth.register.confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                    />
                    <button
                      className="absolute right-0 h-full px-4 text-slate-400 hover:text-slate-600"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs font-normal">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </label>

                {/* Submit Button */}
                <button
                  className="flex min-w-[84px] w-full mt-4 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 focus:ring-offset-background-light disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  type="submit"
                >
                  <span className="truncate">
                    {loading ? t('auth.register.creating') : t('auth.register.submit')}
                  </span>
                </button>
              </form>
            </div>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-slate-500">
              {t('auth.register.hasAccount')}{' '}
              <Link className="font-medium text-primary hover:underline" href="/login">
                {t('auth.login.submit')}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
