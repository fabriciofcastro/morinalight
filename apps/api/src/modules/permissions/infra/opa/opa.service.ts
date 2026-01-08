import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpaService {
  private readonly logger = new Logger(OpaService.name);
  private readonly opaUrl = process.env.OPA_URL || 'http://localhost:8181/v1/data';

  /**
   * Evaluates a policy in OPA.
   * Path should be the policy data path, e.g., 'authz/allow'
   */
  async evaluatePolicy(path: string, input: any): Promise<boolean> {
    try {
      const response = await axios.post(`${this.opaUrl}/${path}`, { input });
      
      // OPA returns { result: boolean } or { result: { allow: boolean } } depending on rego
      const result = response.data?.result;
      
      if (typeof result === 'boolean') {
        return result;
      }
      
      if (result && typeof result === 'object' && 'allow' in result) {
        return !!result.allow;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error evaluating OPA policy at ${path}:`, error);
      // Fail-safe: deny by default
      return false;
    }
  }

  /**
   * Health check for OPA service
   */
  async isHealthy(): Promise<boolean> {
    try {
      await axios.get(`${this.opaUrl.replace('/v1/data', '/health')}`);
      return true;
    } catch {
      return false;
    }
  }
}
