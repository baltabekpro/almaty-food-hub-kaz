
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/restaurants');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-food-primary">Food</span>
          <span className="text-food-secondary">Hub</span>
          <span className="text-food-dark"> KAZ</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto">
          {t('restaurantsSubtitle')}
        </p>
        
        <div className="flex flex-col items-center">
          <Button
            onClick={handleGetStarted}
            className="bg-food-primary hover:bg-food-primary/90 text-white text-lg py-6 px-10 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            {isAuthenticated ? (
              t('continue')
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                {t('login')}
              </>
            )}
          </Button>
          
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-food-primary text-3xl mb-2">🍔</div>
              <div className="font-medium">Алматы</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-food-primary text-3xl mb-2">🍕</div>
              <div className="font-medium">Астана</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-food-primary text-3xl mb-2">🥘</div>
              <div className="font-medium">Шымкент</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-food-primary text-3xl mb-2">🍣</div>
              <div className="font-medium">Караганда</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
