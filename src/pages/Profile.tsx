
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить профиль",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || ''
        });
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user?.id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Успешно",
      description: "Профиль обновлен"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container max-w-lg mx-auto">
        <h1 className="section-title">{t('profile')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              {t('firstName')}
            </label>
            <Input
              id="first_name"
              value={profile.first_name}
              onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
            />
          </div>
          
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              {t('lastName')}
            </label>
            <Input
              id="last_name"
              value={profile.last_name}
              onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {t('phone')}
            </label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <Button type="submit" className="w-full">
            {t('save')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
