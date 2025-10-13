import type { User } from '../../types/api';

export type ProfileState = {
  data: User | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  kycUpload: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
};