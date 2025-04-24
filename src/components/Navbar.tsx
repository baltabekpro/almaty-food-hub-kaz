
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Globe, User, LogIn } from 'lucide-react';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'kk' ? 'ru' : 'kk');
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-food-primary">
          Food<span className="text-food-secondary">Hub</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage} 
            className="flex items-center text-food-dark hover:text-food-primary transition-colors"
          >
            <Globe className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">{language.toUpperCase()}</span>
          </button>
          
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-food-dark hover:text-food-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-food-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="flex items-center"
                >
                  <User className="h-5 w-5 mr-1" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  {t('logout')}
                </Button>
              </div>
            </>
          ) : (
            <Button 
              onClick={() => navigate('/login')}
              className="bg-food-primary hover:bg-food-primary/90 text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {t('login')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
