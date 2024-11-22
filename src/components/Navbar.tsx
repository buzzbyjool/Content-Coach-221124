import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Settings, LogOut, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface NavbarProps {
  onSettingsClick: () => void;
}

function Navbar({ onSettingsClick }: NavbarProps) {
  const { user, signOut, isAdmin } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-4">
            <img 
              src="https://static.wixstatic.com/media/ee6fb8_acd9328cd6a94354acd9f9d0441563b5~mv2.png" 
              alt="EDITUS Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900">Content Coach</span>
          </Link>

          {user && (
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100"
                  title={t('admin.panel')}
                >
                  <Shield className="h-5 w-5" />
                </Link>
              )}
              <button
                onClick={onSettingsClick}
                className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100"
                title={t('common.settings')}
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100"
                title={t('auth.signOut')}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;