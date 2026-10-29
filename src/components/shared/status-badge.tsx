'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import type { VerificationStatus, ApprovalStatus } from '@/types';

interface StatusBadgeProps {
  status: VerificationStatus | ApprovalStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  switch (status) {
    case 'verified':
    case 'approved':
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          {label ?? 'Verified'}
        </Badge>
      );
    case 'unverified':
    case 'pending_verification':
      return (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {label ?? 'Unverified'}
        </Badge>
      );
    case 'unavailable':
    case 'rejected':
      return (
        <Badge variant="destructive" className="gap-1">
          <HelpCircle className="h-3 w-3" />
          {label ?? 'Unavailable'}
        </Badge>
      );
    default:
      return null;
  }
}
