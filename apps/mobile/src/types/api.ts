export interface User {
  userId: string;
  email: string;
  createdAt?: string;
}

export interface Video {
  uploadId: string;
  filename: string;
  status: 'completed' | 'processing' | 'failed' | 'queued' | 'uploaded';
  jobId: string | null;
  uploadedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
