"use client";

import { ConnectionStatusIndicator } from "./connection-status-indicator";
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
