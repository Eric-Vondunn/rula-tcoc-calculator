'use client';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface InfoTipProps {
  children: React.ReactNode;
}

export function InfoTip({ children }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="no-print inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold cursor-help ml-1 hover:bg-rula-sp1 hover:text-rula-purple transition-colors align-middle">
          i
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
