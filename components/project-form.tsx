'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ProjectForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: '',
    isGithub: false,
    repoUrl: '',
    technologies: '',
    visibility: 'public'
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 🚫 Validate required fields
    const trimmedName = formData.name.trim()
    const trimmedDesc = formData.description.trim()
    const trimmedLang = formData.language.trim()
    const trimmedTechs = formData.technologies.trim()
    const trimmedRepo = formData.repoUrl.trim()

    if (!trimmedName || !trimmedDesc || !trimmedLang || !trimmedTechs) {
      setError('Please fill in all required fields.')
      setLoading(false)
      return
    }

    if (formData.isGithub && !/^https:\/\/github\.com\/.+/.test(trimmedRepo)) {
      setError('Please enter a valid GitHub repository URL.')
      setLoading(false)
      return
    }

    if (!session?.user?.id) {
      setError('User session is invalid. Please sign in again.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDesc,
          language: trimmedLang,
          isGithub: formData.isGithub,
          repoUrl: trimmedRepo,
          technologies: trimmedTechs.split(',').map(tech => tech.trim()).filter(Boolean),
          visibility: formData.visibility
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(typeof data.message === 'string' ? data.message : JSON.stringify(data.message))
      }

      router.push('/projects')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Please sign in to create a project</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Main Language
        </label>
        <input
          type="text"
          id="language"
          name="language"
          required
          value={formData.language}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isGithub"
          name="isGithub"
          checked={formData.isGithub}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isGithub" className="ml-2 block text-sm text-gray-900">
          This is a GitHub project
        </label>
      </div>

      {formData.isGithub && (
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
            GitHub Repository URL
          </label>
          <input
            type="url"
            id="repoUrl"
            name="repoUrl"
            required
            value={formData.repoUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="technologies" className="block text-sm font-medium text-gray-700">
          Technologies (comma-separated)
        </label>
        <input
          type="text"
          id="technologies"
          name="technologies"
          required
          value={formData.technologies}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
          Visibility
        </label>
        <select
          id="visibility"
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  )
}
