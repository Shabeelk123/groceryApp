import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-amber-400 font-extrabold text-8xl mb-2">404</p>
        <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="px-6 py-2 border border-[#2a2a2a] text-gray-400 rounded-full hover:border-amber-500/50 hover:text-white transition text-sm">
            ← Go Back
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-amber-500 text-black rounded-full font-bold hover:bg-amber-400 transition text-sm">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
