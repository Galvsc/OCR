'use client'

import Link from 'next/link'
import { useState } from "react";

export default function Signup() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');
    const API_path = process.env.NEXT_PUBLIC_API_path;
    
    // Make the API request for user creation
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
    if (password !== confirm){
          setMessage("The password doesn't match");
        }
    else{
    try {
  
        const response = await fetch(`${API_path}/login/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user,
            password: password,
          }),
        });
        if (response.ok){ 
  
          setMessage('User created successfully. Return to the previous page and log in');
        } else {
          setMessage('User creation failed');
        }
      } catch (error) {
        console.error('Error during login:');
        setMessage('An error occurred. Please try again.');
      }
    }
    };
  
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full items-center max-w-xs">
          <form
            onSubmit={handleSignup}
            className="bg-white shadow-md items-center rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              {/* Username box */}
              <input
                type="text"
                id="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              {/* Password box */}
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-6">
              {/* Password double check box */}
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="confirm"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* User creation request */}
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create User
              </button>
              <Link href="/">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
            Return to Login Page          
              </button>
              </Link>
            </div>
            
            {message && <p className="text-green-500 mt-4">{message}</p>}
          </form>
        </div>
   </div>
    );
}