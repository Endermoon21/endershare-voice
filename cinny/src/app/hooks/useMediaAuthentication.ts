import { useSpecVersions } from './useSpecVersions';

export const useMediaAuthentication = (): boolean => {
  // Force disabled - server has enable_authenticated_media: false
  return false;
};
