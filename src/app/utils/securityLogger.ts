interface SecurityEvent {
  type: 'LOGIN_FAILED' | 'SUSPICIOUS_ACTIVITY' | 'ADMIN_ACTION' | 'RATE_LIMIT' | 'FILE_UPLOAD';
  ip: string;
  userAgent?: string;
  email?: string;
  details: string;
  timestamp: Date;
}

export class SecurityLogger {
  private static events: SecurityEvent[] = [];
  
  static log(event: Omit<SecurityEvent, 'timestamp'>) {
    const logEvent = {
      ...event,
      timestamp: new Date()
    };
    
    this.events.push(logEvent);
    
    // Log to console with appropriate level
    switch (event.type) {
      case 'LOGIN_FAILED':
      case 'SUSPICIOUS_ACTIVITY':
      case 'RATE_LIMIT':
        console.warn(`🚨 ${event.type}: ${event.details} from ${event.ip}`);
        break;
      case 'ADMIN_ACTION':
      case 'FILE_UPLOAD':
        console.info(`🔐 ${event.type}: ${event.details}`);
        break;
    }
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }
  
  static getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }
  
  static getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }
  
  static getEventsByIP(ip: string): SecurityEvent[] {
    return this.events.filter(event => event.ip === ip);
  }
  
  static clearEvents(): void {
    this.events = [];
  }
}