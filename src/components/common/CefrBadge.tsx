import React from 'react';
import { CefrLevel } from '../../types';

interface CefrBadgeProps {
  level: CefrLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CefrBadge: React.FC<CefrBadgeProps> = ({ level, size = 'md', className = '' }) => {
  const colorMap: Record<CefrLevel, string> = {
    A1: 'bg-[#EDF6F2] text-[#2A6F55] border-[#CDE3D8]',
    A2: 'bg-[#E8F4F8] text-[#1E6B8A] border-[#C7E3ED]',
    B1: 'bg-[#FDF4E7] text-[#B26A00] border-[#F5DCB5]',
    B2: 'bg-[#FDF0EB] text-[#C04A33] border-[#F5D3C7]',
    C1: 'bg-[#F3EFF8] text-[#6941C6] border-[#E0D4F0]',
    C2: 'bg-[#F8EDF3] text-[#9E1A5A] border-[#EDCADC]',
  };

  const sizeMap = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl font-bold'
  };

  return (
    <span className={`inline-flex items-center border font-sans tracking-tight ${colorMap[level]} ${sizeMap[size]} ${className}`}>
      {level}
    </span>
  );
};
