declare module 'react-native-get-sms-android' {
  export interface SmsFilter {
    box?: string;
    maxCount?: number;
    address?: string;
    body?: string;
    read?: number;
    indexFrom?: number;
    minDate?: number;
    maxDate?: number;
  }

  export interface SmsMessage {
    _id: string;
    thread_id: string;
    address: string;
    body: string;
    date: number;
    date_sent: number;
    read: number;
    status: number;
    type: number;
    service_center: string;
  }

  export default {
    list: (
      filter: string,
      fail: (error: string) => void,
      success: (count: number, smsList: string) => void,
    ) => void,
    delete: (
      _id: string,
      fail: (error: string) => void,
      success: () => void,
    ) => void,
  };
}

