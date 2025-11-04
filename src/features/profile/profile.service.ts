import { getUserProfile, updateUserProfile as updateProfileApi, kycUpload, updateProfileImageApi } from '../../lib/api';

export const getProfile = async () => {
  return getUserProfile();
};

export const updateUserProfile = async (payload: Partial<{ name: string; phone: string; address: string }>) => {
  return updateProfileApi(payload);
};

export const updateUserProfileImage = async (formData: FormData) => {
  return updateProfileImageApi(formData);
};

export const uploadKyc = async (payload: { document_type: string; document_url: string }) => {
  return kycUpload(payload);
};