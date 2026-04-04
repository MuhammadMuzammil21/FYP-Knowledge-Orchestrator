import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVoiceIdentity, registerVoiceIdentity, deleteVoiceIdentity } from '@/lib/api/users';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/client';

export function useVoiceIdentity() {
  return useQuery({
    queryKey: ['voice-identity'],
    queryFn: getVoiceIdentity,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegisterVoiceIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audioData: Blob) => registerVoiceIdentity(audioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-identity'] });
      toast.success('Voice identity registered successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteVoiceIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVoiceIdentity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-identity'] });
      toast.success('Voice identity deleted successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
