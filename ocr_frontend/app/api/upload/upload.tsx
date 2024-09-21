'use client'

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface FileData {
  file_id: number;
  user_id: number;
  filename: string;
  extractStatus: string;
  extractedText: string;
  createdAt: string;
}

export default function Upload() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<string | null>(null);
  const [seeText, setSeeText] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [IsFetching, setIsFetching] = useState<boolean>(false);

  const API_path = process.env.NEXT_PUBLIC_API_path;
  const apiEndpoint = `${API_path}/ocr`;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of files per page

  // Calculate total pages
  const totalPages = Math.ceil(files.length / itemsPerPage);
  const sortedFiles = [...files].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get current files for the page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFiles = sortedFiles.slice(startIndex, startIndex + itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const userId = Cookies.get('user_id');
  const token = Cookies.get('token'); 

  // Fetch user files information to create table
  const fetchFiles = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${apiEndpoint}/list?user_id=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setFiles(data);
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally{
      setIsFetching(false);
    }
  };

    //Fetch file automatically
  useEffect(() => {
    fetchFiles();
  }, [userId, token]);

  //Upload and extract text from image
  const handleFileUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
  
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', userId || '');
  
      try {
        const response = await fetch(`${apiEndpoint}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        const result = await response.json();
        if (response.ok) {
          setUploadResponse(result.extractedText || 'File uploaded successfully');
          await fetchFiles(); // Refresh the file list
        } else {
          setUploadResponse('File upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Fetch file recognized text
  const handleSeeText = async (file_id: number) => {
    try {
      const response = await fetch(`${apiEndpoint}/text?file_id=${file_id}&user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      
      const result = await response.json();
      if (response.ok) {
        setSeeText(result.extractedText);
      }

    } catch (error) {
      console.error('Error seeing text:', error);
  }}

  //Download PDF
  const handleFileClick = async (file_id: number) => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${apiEndpoint}/download?file_id=${file_id}&user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download the file');
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.pdf'; 
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const Spinner = () => (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="container mx-auto pt-4 pb-8">
      {/* Upload Button */}
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded mr-4"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {selectedFile ? 'Change file' : 'Upload file'}
      </button>
      <input
        id="file-input"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
        onClick={handleFileUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Submit'}
      </button>

      {isUploading && <Spinner />}
      {isDownloading && <Spinner />}

      {/* Upload Response Pop-Up */}
      {uploadResponse && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-2">Extracted text:</h2>
            <p>{uploadResponse}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setUploadResponse(null)}
            >
              Return
            </button>
          </div>
        </div>
      )}

      {/* See text Pop-Up */}
      {seeText && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-2">Extracted text:</h2>
            <p>{seeText}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setSeeText(null)}
            >
              Return
            </button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Your Files</h1>
      {IsFetching ? <Spinner/> : (
      <table className="min-w-full border-2 border-gray-500">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 text-left border border-gray-400">File Name</th>
            <th className="px-4 py-2 text-left border border-gray-400">Date</th>
            <th className="px-4 py-2 text-left border border-gray-400">Text</th>
          </tr>
        </thead>
        <tbody>
          {currentFiles.map((file) => (
            <tr key={file.file_id} className="border-t">
              <td
                className="px-4 py-2 text-blue-600 cursor-pointer hover:underline border border-gray-300"
                onClick={() => handleFileClick(file.file_id)}
              >
                {file.filename}
              </td>
              <td className="px-4 py-2 border border-gray-300">{new Date(file.createdAt).toLocaleDateString()}</td>
              <td
                className="px-4 py-2 text-blue-600 cursor-pointer hover:underline border border-gray-300"
                onClick={() => handleSeeText(file.file_id)}
              >
                See text
              </td>
            </tr>
          ))}
        </tbody>
      </table>)}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`px-4 py-2 mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} rounded`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
