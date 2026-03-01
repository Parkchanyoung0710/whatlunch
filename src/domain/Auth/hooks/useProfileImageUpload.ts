import { useCallback, useState } from 'react';
import { authServiceClient } from '@/services/backend/auth.api';
import { useAuthStore } from '@/domain/Auth/store/auth.store';

export function useProfileImageUpload() {
  const { user, setUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  const uploadProfileImage = useCallback(
    async (file: File) => {
      if (!user) return;

      setIsUploading(true);
      try {
        const { uploadUrl, fileUrl } = await authServiceClient.createProfileImagePresign(file.type);

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
        }

        const updatedUser = await authServiceClient.updateMe({
          profileImage: fileUrl,
        });

        setUser(updatedUser);

        return fileUrl;
      } catch (error) {
        console.error('[ProfileImageUpload]', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [user, setUser]
  );

  const removeProfileImage = useCallback(async () => {
    if (!user) return;

    setIsUploading(true);

    try {
      const updatedUser = await authServiceClient.deleteProfileImage();
      setUser(updatedUser);
    } finally {
      setIsUploading(false);
    }
  }, [user, setUser]);

  return {
    uploadProfileImage,
    removeProfileImage,
    isUploading,
  };
}
