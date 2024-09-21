import Login from './api/login/login';

export default function LoginPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold  text-center mb-4">OCR Service</h1>
      <Login />
    </div>
  );
}
