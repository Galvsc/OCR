'use client'

import Link from 'next/link'
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function Login() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const API_path = process.env.NEXT_PUBLIC_API_path;
    const apiEndpoint = `${API_path}/login`;

     // Make the API request for validate user and password
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user,
            password: password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const token = data.access_token;
          const userId = data.user_id;
          Cookies.set('user_id', userId); 
  
          if (token) {
            Cookies.set('token', token); // Store token in a cookie
          }
          router.push('/upload'); // Redirectis to user page
        } else {
          setMessage('Login failed. Please check your credentials.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        setMessage('An error occurred. Please try again.');
      }
    };
  
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full items-center max-w-xs">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md items-center rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              {/* Login request */}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Log In
              </button>
              <Link href="/signup" className="text-blue-500 text-center underline">
                Sign up
            </Link>
            </div>
            
            {message && <p className="text-green-500 mt-4">{message}</p>}
          </form>
        </div>
   </div>
    );
}