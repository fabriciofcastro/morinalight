/**
 * LoginDTO
 */
export interface LoginDTO {
  email: string;
  password?: string;
  remember?: boolean;
  provider?: 'credentials' | 'google' | 'github';
}
