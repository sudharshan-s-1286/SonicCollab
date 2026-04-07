import React from 'react';
import SignupForm from '../components/forms/SignupForm';
import { Music } from 'lucide-react';

const SignupPage = () => {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accentAmber/20 rounded-full blur-3xl -z-10 mix-blend-screen opacity-50 pointer-events-none"></div>
      
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accentAmber to-accentViolet flex items-center justify-center shadow-lg">
          <Music className="text-white" size={24} />
        </div>
        <h1 className="text-3xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-accentAmber to-white">SonicCollab</h1>
      </div>
      
      <SignupForm />
    </div>
  );
};

export default SignupPage;
