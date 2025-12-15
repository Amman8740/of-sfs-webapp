import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/toasts/use-toast';

interface PersonItem {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Creator';
  agencyId?: string;
}

interface AgencyAdmin {
  id: string;
  email: string;
  name: string;
  role: 'Admin';
}

interface PeopleData {
  success: boolean;
  agencyId: string;
  agencyAdmin: AgencyAdmin;
  creators: PersonItem[];
  total: number;
  stats: {
    linked: number;
    joinRequests: number;
    pending: number;
    approved: number;
  };
}

interface UseAgencyPeopleReturn {
  people: PersonItem[];
  agencyAdmin: AgencyAdmin | null;
  agencyId: string;
  isLoading: boolean;
  error: string | null;
  fetchPeople: () => Promise<void>;
  removeCreator: (creatorId: string) => Promise<boolean>;
  isRemoving: boolean;
}

export const useAgencyPeople = (): UseAgencyPeopleReturn => {
  const { toast } = useToast();
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [agencyAdmin, setAgencyAdmin] = useState<AgencyAdmin | null>(null);
  const [agencyId, setAgencyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchPeople = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/agency/people');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch people');
      }

      const data: PeopleData = await response.json();

      setAgencyId(data.agencyId);
      setAgencyAdmin(data.agencyAdmin);
      setPeople(data.creators);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const removeCreator = useCallback(async (creatorId: string): Promise<boolean> => {
    try {
      setIsRemoving(true);

      const response = await fetch('/api/agency/remove-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove creator');
      }

      // Remove from local state
      setPeople(prev => prev.filter(person => person.id !== creatorId));

      toast({
        title: 'Success',
        description: 'Creator has been removed from your agency.',
        variant: 'default',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRemoving(false);
    }
  }, [toast]);

  return {
    people,
    agencyAdmin,
    agencyId,
    isLoading,
    error,
    fetchPeople,
    removeCreator,
    isRemoving,
  };
};