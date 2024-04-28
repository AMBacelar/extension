type LogDataPayload = {
  [key: string]: string | number | boolean;
};

type LogData = {
  type: string;
  payload: LogDataPayload;
  timestamp: string;
};

export class AnalyticsLogger {
  private static instance: AnalyticsLogger;
  private logEndpoint: string;

  private constructor(logEndpoint: string) {
    this.logEndpoint = logEndpoint;
  }

  static getInstance(logEndpoint: string): AnalyticsLogger {
    if (!AnalyticsLogger.instance) {
      AnalyticsLogger.instance = new AnalyticsLogger(logEndpoint);
    }
    return AnalyticsLogger.instance;
  }

  logEvent(eventName: string, eventData: LogDataPayload): void {
    const logData: LogData = {
      type: eventName,
      payload: eventData,
      timestamp: new Date().toISOString(),
    };

    // Send log data to the server
    this.sendLogData(logData);
  }

  private sendLogData(data: LogData): void {
    // Example: Send log data to server using fetch API
    fetch(this.logEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to send log data');
        }
      })
      .catch((error) => {
        console.error('Error logging event:', error);
      });
  }
}
