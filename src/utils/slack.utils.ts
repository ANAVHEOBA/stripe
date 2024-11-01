// src/utils/slack.utils.ts
import axios from 'axios';
import { env } from '../config';
import { Logger } from './logger.utils';

export async function sendSlackNotification(message: any): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) {
    Logger.warn('Slack webhook URL not configured');
    return;
  }

  try {
    await axios.post(env.SLACK_WEBHOOK_URL, message);
  } catch (error) {
    Logger.error('Failed to send Slack notification:', error);
    throw error;
  }
}