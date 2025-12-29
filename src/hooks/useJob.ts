import { useState, useCallback, useEffect, useRef } from 'react';

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UseJobOptions {
  onComplete?: (job: Job) => void;
  onError?: (job: Job) => void;
  initialBackoff?: number;
  maxBackoff?: number;
}

export interface UseJobReturn {
  job: Job | null;
  isLoading: boolean;
  error: string | null;
  startJob: (endpoint: string, data?: unknown) => Promise<void>;
  pollJob: (jobId: string) => Promise<void>;
}

const DEFAULT_INITIAL_BACKOFF = 1000; // 1 second
const DEFAULT_MAX_BACKOFF = 10000; // 10 seconds

export function useJob(options: UseJobOptions = {}): UseJobReturn {
  const {
    onComplete,
    onError,
    initialBackoff = DEFAULT_INITIAL_BACKOFF,
    maxBackoff = DEFAULT_MAX_BACKOFF,
  } = options;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentBackoffRef = useRef<number>(initialBackoff);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  const checkJobStatus = useCallback(
    async (jobId: string): Promise<Job> => {
      const response = await fetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch job status: ${response.statusText}`);
      }

      const jobData: Job = await response.json();
      return jobData;
    },
    []
  );

  const pollJob = useCallback(
    async (jobId: string): Promise<void> => {
      try {
        const jobData = await checkJobStatus(jobId);
        setJob(jobData);

        if (jobData.status === 'completed') {
          setIsLoading(false);
          currentBackoffRef.current = initialBackoff;
          if (onComplete) {
            onComplete(jobData);
          }
        } else if (jobData.status === 'failed') {
          setIsLoading(false);
          setError(jobData.error || 'Job failed');
          currentBackoffRef.current = initialBackoff;
          if (onError) {
            onError(jobData);
          }
        } else {
          // Job is still pending or processing, continue polling with exponential backoff
          const nextBackoff = Math.min(currentBackoffRef.current * 2, maxBackoff);
          currentBackoffRef.current = nextBackoff;

          pollTimeoutRef.current = setTimeout(() => {
            pollJob(jobId);
          }, currentBackoffRef.current);
        }
      } catch (err) {
        setIsLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        currentBackoffRef.current = initialBackoff;
      }
    },
    [checkJobStatus, initialBackoff, maxBackoff, onComplete, onError]
  );

  const startJob = useCallback(
    async (endpoint: string, data?: unknown): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setJob(null);
      currentBackoffRef.current = initialBackoff;

      // Clear any existing poll timeout
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`Failed to start job: ${response.statusText}`);
        }

        const jobData: Job = await response.json();
        setJob(jobData);

        // Start polling for job status
        if (jobData.id) {
          pollJob(jobData.id);
        }
      } catch (err) {
        setIsLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      }
    },
    [initialBackoff, pollJob]
  );

  return {
    job,
    isLoading,
    error,
    startJob,
    pollJob,
  };
}
