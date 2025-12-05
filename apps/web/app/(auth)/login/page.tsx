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

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, isAuthenticated, token } = useAuthStore()
  const { t } = useTranslation()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError('')
      const response = await authApi.login(data)
      setAuth(response.user, response.accessToken)
      router.push('/search')
      router.refresh()
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials and try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light">
      <div className="flex flex-1 w-full">
        {/* Left side - Brand showcase (hidden on mobile) */}
        <div className="relative hidden w-1/2 flex-col items-center justify-center bg-gray-100 lg:flex">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            alt="Abstract network of lines and dots representing global data connections"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHzIE-0gDjboM4iLE0WL2891OFEZ5yNxd0-zI4hOPvh7gMs7NoshZHxvKLk-XNxAm3BwfF8VwQMOOLbcMGtg_XZy8fd5FPppsnmFICASxNjNqIo9H1qiHYeJpiexe4zbqgaKNWfDav2bNT61POTyMvYmshFY5o-8yctK4OLHlfYdckSBKlwkXpZMaEunx6Dbw02Sb_t27v4a-upg-RSymlzKokIGkjJTyNH6720P66xixSHS2Hi69u0lN2pvkLKL_tRcPVtYv6Q9X-"
          />
          <div className="relative z-10 flex flex-col items-start p-16 max-w-lg text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary p-2 rounded-lg text-white">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                >
                  language
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">{t('auth.brand.name')}</h1>
            </div>
            <p className="text-4xl font-bold tracking-tight text-gray-800">
              {t('auth.brand.tagline')}
            </p>
            <p className="mt-4 text-lg text-gray-600">{t('auth.brand.description')}</p>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex w-full flex-1 items-center justify-center bg-background-light lg:w-1/2 p-6 sm:p-8">
          <div className="flex w-full max-w-md flex-col items-center justify-center">
            <div className="w-full">
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
                  {t('auth.login.title')}
                </h1>
                <p className="text-gray-600 text-base font-normal leading-normal mt-2">
                  {t('auth.login.subtitle')}
                </p>
              </div>

              <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <label className="flex flex-col w-full">
                  <p className="text-[#111418] text-base font-medium leading-normal pb-2">
                    {t('auth.login.emailOrUsername')}
                  </p>
                  <div className="relative flex w-full items-center">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined absolute left-4 text-gray-500"
                    >
                      mail
                    </span>
                    <input
                      {...register('emailOrUsername')}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-none focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] bg-white h-14 placeholder:text-[#617289] pl-12 pr-4 text-base font-normal leading-normal"
                      placeholder={t('auth.login.emailOrUsername')}
                      type="text"
                    />
                  </div>
                  {errors.emailOrUsername && (
                    <p className="mt-2 text-sm text-red-500">{errors.emailOrUsername.message}</p>
                  )}
                </label>

                <label className="flex flex-col w-full">
                  <div className="flex justify-between items-center pb-2">
                    <p className="text-[#111418] text-base font-medium leading-normal">
                      {t('auth.login.password')}
                    </p>
                    <Link
                      className="text-primary hover:underline text-sm font-medium leading-normal"
                      href="#"
                    >
                      {t('auth.login.forgotPassword')}
                    </Link>
                  </div>
                  <div className="relative flex w-full items-center">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined absolute left-4 text-gray-500"
                    >
                      lock
                    </span>
                    <input
                      {...register('password')}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-none focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] bg-white h-14 placeholder:text-[#617289] pl-12 pr-12 text-base font-normal leading-normal"
                      placeholder={t('auth.login.password')}
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute right-0 flex h-full w-12 items-center justify-center text-gray-500 hover:text-primary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </label>

                <button
                  className="flex h-14 w-full items-center justify-center gap-x-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold leading-6 text-white shadow-sm transition-all hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? t('auth.login.signingIn') : t('auth.login.submit')}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[#617289] text-base font-normal leading-normal">
                  {t('auth.login.noAccount')}{' '}
                  <Link className="font-semibold text-primary hover:underline" href="/register">
                    {t('auth.register.submit')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
