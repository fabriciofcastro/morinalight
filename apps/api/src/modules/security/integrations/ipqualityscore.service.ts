// NestJS imports removed
import axios from "axios";

/**
 * Resultado da análise de IP
 */
export interface IPQualityAnalysis {
  success: boolean;
  fraud_score: number;
  country_code: string;
  city?: string;
  region?: string;
  isp?: string;
  organization?: string;

  // Detecções
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  active_vpn: boolean;
  active_tor: boolean;

  // Características
  mobile: boolean;
  bot_status: boolean;
  recent_abuse: boolean;
  abuse_velocity: "none" | "low" | "medium" | "high";

  // Reputação
  is_crawler: boolean;
  connection_type: "Residential" | "Corporate" | "Education" | "Mobile" | "Data Center";

  // Localização
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

/**
 * IPQualityScoreService
 * Serviço de detecção de VPN, Proxy, Tor e análise de fraude
 */
export class IPQualityScoreService {
  private apiKey: string;
  private baseUrl = "https://ipqualityscore.com/api/json/ip";

  constructor() {
    this.apiKey = process.env.IPQUALITYSCORE_API_KEY || "";

    if (!this.apiKey) {
      console.warn("[IPQualityScore] API Key não configurada");
      console.warn("[IPQualityScore] Configure IPQUALITYSCORE_API_KEY no .env");
    }
  }

  /**
   * Analisa um endereço IP
   */
  async analyzeIP(ipAddress: string, strictness: 0 | 1 | 2 = 1): Promise<IPQualityAnalysis | null> {
    if (!this.apiKey) {
      console.warn("[IPQualityScore] API Key não configurada, retornando null");
      return null;
    }

    try {
      const url = `${this.baseUrl}/${this.apiKey}/${ipAddress}`;
      const params = {
        strictness, // 0 = permissivo, 1 = moderado, 2 = estrito
        allow_public_access_points: "true",
        fast: "false", // false = análise completa
        mobile: "true",
      };

      const response = await axios.get(url, { params });

      if (response.data.success === false) {
        console.error("[IPQualityScore] Erro na API:", response.data.message);
        return null;
      }

      return response.data as IPQualityAnalysis;
    } catch (error) {
      console.error("[IPQualityScore] Erro ao analisar IP:", error);
      return null;
    }
  }

  /**
   * Verifica se IP é VPN
   */
  async isVPN(ipAddress: string): Promise<boolean> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.vpn || analysis?.active_vpn || false;
  }

  /**
   * Verifica se IP é Proxy
   */
  async isProxy(ipAddress: string): Promise<boolean> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.proxy || false;
  }

  /**
   * Verifica se IP é Tor
   */
  async isTor(ipAddress: string): Promise<boolean> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.tor || analysis?.active_tor || false;
  }

  /**
   * Verifica se IP é suspeito (VPN, Proxy ou Tor)
   */
  async isSuspicious(ipAddress: string): Promise<boolean> {
    const analysis = await this.analyzeIP(ipAddress);

    if (!analysis) {
      return false;
    }

    return (
      analysis.vpn ||
      analysis.proxy ||
      analysis.tor ||
      analysis.active_vpn ||
      analysis.active_tor ||
      analysis.bot_status ||
      analysis.recent_abuse
    );
  }

  /**
   * Calcula score de risco (0-100)
   */
  async getRiskScore(ipAddress: string): Promise<number> {
    const analysis = await this.analyzeIP(ipAddress);

    if (!analysis) {
      return 0;
    }

    let score = analysis.fraud_score;

    // Ajustes adicionais
    if (analysis.vpn || analysis.active_vpn) score += 20;
    if (analysis.proxy) score += 20;
    if (analysis.tor || analysis.active_tor) score += 30;
    if (analysis.bot_status) score += 15;
    if (analysis.recent_abuse) score += 25;

    // Limita a 100
    return Math.min(score, 100);
  }

  /**
   * Obtém tipo de conexão
   */
  async getConnectionType(ipAddress: string): Promise<string | null> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.connection_type || null;
  }

  /**
   * Verifica se é bot
   */
  async isBot(ipAddress: string): Promise<boolean> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.bot_status || analysis?.is_crawler || false;
  }

  /**
   * Verifica se é mobile
   */
  async isMobile(ipAddress: string): Promise<boolean> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.mobile || false;
  }

  /**
   * Obtém ISP
   */
  async getISP(ipAddress: string): Promise<string | null> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.isp || null;
  }

  /**
   * Verifica se IP teve abuso recente
   */
  async hasRecentAbuse(ipAddress: string): Promise<boolean> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.recent_abuse || false;
  }

  /**
   * Obtém velocidade de abuso
   */
  async getAbuseVelocity(ipAddress: string): Promise<"none" | "low" | "medium" | "high"> {
    const analysis = await this.analyzeIP(ipAddress);
    return analysis?.abuse_velocity || "none";
  }

  /**
   * Análise completa com recomendação
   */
  async analyzeWithRecommendation(ipAddress: string): Promise<{
    analysis: IPQualityAnalysis | null;
    riskScore: number;
    recommendation: "allow" | "review" | "block";
    reasons: string[];
  }> {
    const analysis = await this.analyzeIP(ipAddress);

    if (!analysis) {
      return {
        analysis: null,
        riskScore: 0,
        recommendation: "allow",
        reasons: ["Análise não disponível"],
      };
    }

    const riskScore = await this.getRiskScore(ipAddress);
    const reasons: string[] = [];

    if (analysis.vpn || analysis.active_vpn) reasons.push("VPN detectada");
    if (analysis.proxy) reasons.push("Proxy detectado");
    if (analysis.tor || analysis.active_tor) reasons.push("Tor detectado");
    if (analysis.bot_status) reasons.push("Bot detectado");
    if (analysis.recent_abuse) reasons.push("Abuso recente");
    if (analysis.fraud_score > 75) reasons.push("Score de fraude alto");

    let recommendation: "allow" | "review" | "block" = "allow";

    if (riskScore >= 80) {
      recommendation = "block";
    } else if (riskScore >= 50) {
      recommendation = "review";
    }

    return {
      analysis,
      riskScore,
      recommendation,
      reasons,
    };
  }
}
