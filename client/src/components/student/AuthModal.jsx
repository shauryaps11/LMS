import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const AuthModal = () => {
    const { login, register, setShowLogin } = useContext(AppContext)
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            let data
            if (isLogin) {
                data = await login(form.email, form.password)
            } else {
                data = await register(form.name, form.email, form.password)
            }

            if (data.success) {
                toast.success(isLogin ? 'Welcome back!' : 'Account created!')
                setShowLogin(false)
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowLogin(false)}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    {isLogin ? 'Sign in to continue learning' : 'Join EduFlow today'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required={!isLogin}
                                placeholder="John Doe"
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••"
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition"
                    >
                        {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-4 text-sm text-center text-gray-500">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        className="text-blue-600 font-medium hover:underline"
                        onClick={() => setIsLogin(v => !v)}
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default AuthModal
