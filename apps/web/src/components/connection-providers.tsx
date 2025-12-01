"use client";

import { ConnectionStatusIndicator } from "./connection-status-indicator";
import { RealtimeNotificationsProvider } from "./notifications/realtime-notifications-provider";
import { OfflineSyncNotification } from "./offline-sync-notification";

export function ConnectionProviders() {
  return (
    <>
      <ConnectionStatusIndicator />
      <OfflineSyncNotification />
      {/* Temporarily disabled - WebSocket server not configured */}
      {/* <RealtimeNotificationsProvider /> */}
    </>
  );
}
