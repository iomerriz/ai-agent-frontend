import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Users() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users')
        setUser(response.data)
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login')
        } else {
          setError('Failed to fetch profile')
        }
      }
    }
    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Go to Chat
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Age: {user?.age}</p>
          <p>ID: {user?.id}</p>
        </div>

      </div>
    </div>
  )

}

export default Users
