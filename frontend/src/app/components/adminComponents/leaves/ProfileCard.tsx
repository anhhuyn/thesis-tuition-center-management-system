// src/app/components/leaves/ProfileCard.tsx
import React from 'react';
import { LogOut, User } from 'lucide-react';

interface ProfileCardProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ userName, userRole, onLogout }) => {
  return (
    <section className="mt-auto pt-6 border-t border-gray-200">
      <div className="bg-purple-600 from-purple-600 to-indigo-600 p-5 rounded-2xl text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{userName}</p>
            <p className="text-xs text-white/70">{userRole}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};