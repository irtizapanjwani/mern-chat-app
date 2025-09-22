import { useState } from 'react';
import { useChat } from '../context/ChatContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const { loginUser } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      loginUser(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Chat</h1>
          <p className="text-gray-600">Enter your username to start chatting</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 bg-white"
              maxLength={20}
              required
              autoComplete="off"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Join Chat Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;