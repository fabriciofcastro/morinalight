import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export type Fail2BanLogEntry = {
  timestamp: Date;
  ip: string;
  email: string;
  reason: string;
  severity: "info" | "warning" | "error";
};

export class Fail2BanLogger {
  private readonly logDir: string;
  private readonly logFile: string;

  constructor(logDir = "/var/log/morina") {
    this.logDir = logDir;
    this.logFile = join(logDir, "auth-failures.log");
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    try {
      if (!existsSync(this.logDir)) {
        mkdirSync(this.logDir, { recursive: true, mode: 0o755 });
      }
    } catch (error) {
      console.error("Failed to create log directory:", error);
    }
  }

  logFailedLogin(entry: Fail2BanLogEntry): void {
    try {
      // Formato compatível com Fail2Ban:
      // [timestamp] [severity] [ip] [email] [reason]
      const logLine = `[${entry.timestamp.toISOString()}] [${entry.severity.toUpperCase()}] [${entry.ip}] [${entry.email}] ${entry.reason}\n`;

      appendFileSync(this.logFile, logLine, { encoding: "utf-8", mode: 0o644 });

      console.log(`📝 [FAIL2BAN] Logged failed login: ${entry.ip} - ${entry.email}`);
    } catch (error) {
      console.error("Failed to write to Fail2Ban log:", error);
    }
  }

  logMultipleFailures(ip: string, count: number): void {
    this.logFailedLogin({
      timestamp: new Date(),
      ip,
      email: "MULTIPLE_USERS",
      reason: `${count} failed login attempts from this IP`,
      severity: "error",
    });
  }

  logBruteForceAttempt(ip: string, email: string): void {
    this.logFailedLogin({
      timestamp: new Date(),
      ip,
      email,
      reason: "Potential brute force attack detected",
      severity: "error",
    });
  }

  logRateLimitExceeded(ip: string): void {
    this.logFailedLogin({
      timestamp: new Date(),
      ip,
      email: "RATE_LIMITED",
      reason: "Rate limit exceeded",
      severity: "warning",
    });
  }
}

export const fail2banLogger = new Fail2BanLogger();

/**
 * Fail2Ban Configuration Example:
 *
 * Create /etc/fail2ban/filter.d/morina-auth.conf:
 *
 * [Definition]
 * failregex = ^\[.*\] \[ERROR\] \[<HOST>\] \[.*\] .*$
 * ignoreregex =
 *
 * Create /etc/fail2ban/jail.d/morina-auth.conf:
 *
 * [morina-auth]
 * enabled = true
 * port = http,https
 * filter = morina-auth
 * logpath = /var/log/morina/auth-failures.log
 * maxretry = 10
 * findtime = 600
 * bantime = 3600
 * action = iptables-multiport[name=morina, port="http,https"]
 */
