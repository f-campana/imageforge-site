"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  DEFAULT_PACKAGE_MANAGER,
  PACKAGE_MANAGER_CHANGE_EVENT,
  PACKAGE_MANAGER_STORAGE_KEY,
  type PackageManager,
  isPackageManager,
} from "@/components/landing/package-managers";

function resolveStoredPackageManager(): PackageManager {
  if (typeof window === "undefined") {
    return DEFAULT_PACKAGE_MANAGER;
  }

  const storedManager = window.localStorage.getItem(
    PACKAGE_MANAGER_STORAGE_KEY,
  );

  if (storedManager && isPackageManager(storedManager)) {
    return storedManager;
  }

  return DEFAULT_PACKAGE_MANAGER;
}

export function usePackageManagerPreference() {
  const packageManager = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleStorage = (event: StorageEvent) => {
        if (event.key === PACKAGE_MANAGER_STORAGE_KEY) {
          onStoreChange();
        }
      };

      const handleSameTabChange = () => {
        onStoreChange();
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(
        PACKAGE_MANAGER_CHANGE_EVENT,
        handleSameTabChange as EventListener,
      );

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(
          PACKAGE_MANAGER_CHANGE_EVENT,
          handleSameTabChange as EventListener,
        );
      };
    },
    resolveStoredPackageManager,
    () => DEFAULT_PACKAGE_MANAGER,
  );

  const setPreferredPackageManager = useCallback(
    (nextManager: PackageManager) => {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, nextManager);
      window.dispatchEvent(new Event(PACKAGE_MANAGER_CHANGE_EVENT));
    },
    [],
  );

  return {
    packageManager,
    setPreferredPackageManager,
  };
}
