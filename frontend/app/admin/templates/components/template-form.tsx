// app/admin/templates/components/template-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const templateSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  slug: z.string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets'),
  price: z.coerce.number().min(0, 'Le prix doit être positif'),
  folder_name: z.string().min(1, 'Le nom du dossier technique est requis'),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface TemplateFormProps {
  initialData?: any // Flexible for backend data
  onSubmit: (data: TemplateFormData) => Promise<void>
  isSubmitting: boolean
}

export function TemplateForm({
  initialData,
  onSubmit,
  isSubmitting
}: TemplateFormProps) {
  const router = useRouter()
  const [slugPreview, setSlugPreview] = useState(initialData?.slug || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      is_premium: false,
      is_active: true,
      ...initialData,
    },
  })

  const watchedName = watch('name')

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const newSlug = generateSlug(name)
    setValue('slug', newSlug, { shouldValidate: true })
    setSlugPreview(newSlug)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Informations générales</h3>
            <p className="mt-1 text-sm text-gray-500">
              Informations de base sur le template
            </p>
          </div>
          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom du template
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  onChange={(e) => {
                    register('name').onChange(e)
                    handleNameChange(e)
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    /templates/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    {...register('slug')}
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  URL: /templates/{slugPreview || 'mon-template'}
                </p>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Prix (Euro)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  {...register('price')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="folder_name" className="block text-sm font-medium text-gray-700">
                  Dossier technique (dans backend/templates/)
                </label>
                <input
                  type="text"
                  id="folder_name"
                  {...register('folder_name')}
                  placeholder="ex: professional"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.folder_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.folder_name.message}</p>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="col-span-6">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="is_active"
                      type="checkbox"
                      {...register('is_active')}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="is_active" className="font-medium text-gray-700">
                      Template actif
                    </label>
                    <p className="text-gray-500">Ce template est visible par les utilisateurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}