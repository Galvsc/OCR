'use client'

import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie';
import Upload from '../api/upload/upload';

export default function UploadPage() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('user_id');
    Cookies.remove('token');

    // Redirect to the main page
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4">
      {/* Logout Button */}
      <button
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={handleLogout}
      >
        Logout
      </button>

      <h1 className="text-2xl font-bold mb-4">OCR Service</h1>
      <Upload />
    </div>
  );
}

