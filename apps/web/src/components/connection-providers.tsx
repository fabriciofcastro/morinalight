"use client";

import { ConnectionStatusIndicator } from "./connection-status-indicator";
import { OfflineSyncNotification } from "./offline-sync-notification";
import { RealtimeNotificationsProvider } from "./notifications/realtime-notifications-provider";

export function ConnectionProviders() {
  return (
    <>
      <ConnectionStatusIndicator />
      <OfflineSyncNotification />
      <RealtimeNotificationsProvider />
    </>
  );
}

