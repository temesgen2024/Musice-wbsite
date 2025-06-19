import React from 'react';
import { Card, CardContent } from '../../components/ui/card';

type Props = {};

const Login: React.FC<Props> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <div className="w-[50%] mx-auto px-5">
        <div className="text-white mx-7 bg-red-600">
          <h1 className="text-xl font-bold mb-6 text-gray-800">Login</h1>
          <form className="space-y-4" aria-label="Login Form">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;