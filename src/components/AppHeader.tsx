import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const getUserInitials = (user: { full_name?: string; username?: string; email?: string } | null) => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex justify-between items-start mb-8 animate-fade-in">
      <div className="flex-1">
        {title && (
          <h1 className="text-4xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-green-700/80 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {children}
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt={user?.username || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-nutrition-green to-nutrition-emerald text-white font-semibold">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 backdrop-blur-lg bg-white/95 border border-white/30" 
            align="end" 
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || user?.username || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleProfile}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem 
              onClick={() => navigate('/settings')}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppHeader; 