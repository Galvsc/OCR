import Signup from '../api/signup/signup';

export default function SingUpPage() {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold  text-center mb-4">OCR Service</h1>
        <Signup />
      </div>
    );
  }