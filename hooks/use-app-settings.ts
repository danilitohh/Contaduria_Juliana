"use client";

import { useSyncExternalStore } from "react";
import { companySettings as defaultCompanySettings, profile as defaultProfile } from "@/services/mock-data";
import type { CompanySettings, Profile } from "@/types/business";

export interface AppSettings {
  company: CompanySettings;
  profile: Profile;
}

const storageKey = "nexo_app_settings";
const listeners = new Set<() => void>();

const defaultSettings: AppSettings = {
  company: { ...defaultCompanySettings },
  profile: { ...defaultProfile },
};

let settings: AppSettings = defaultSettings;
let loaded = false;
let storageListenerInstalled = false;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeSettings(value: unknown): AppSettings {
  const candidate = value as Partial<AppSettings> | null;

  return {
    company: {
      ...defaultSettings.company,
      ...(candidate?.company ?? {}),
    },
    profile: {
      ...defaultSettings.profile,
      ...(candidate?.profile ?? {}),
    },
  };
}

function loadSettings() {
  if (loaded || !canUseStorage()) return;

  loaded = true;

  try {
    const stored = window.localStorage.getItem(storageKey);
    settings = stored ? normalizeSettings(JSON.parse(stored)) : defaultSettings;
  } catch {
    settings = defaultSettings;
  }
}

function persistSettings() {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Local settings should never break the app.
  }
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function installStorageListener() {
  if (storageListenerInstalled || typeof window === "undefined") return;

  storageListenerInstalled = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey) return;

    try {
      settings = event.newValue ? normalizeSettings(JSON.parse(event.newValue)) : defaultSettings;
    } catch {
      settings = defaultSettings;
    }

    emitChange();
  });
}

export function getDefaultAppSettings() {
  return defaultSettings;
}

export function getAppSettingsSnapshot() {
  loadSettings();
  return settings;
}

export function subscribeAppSettings(listener: () => void) {
  installStorageListener();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveAppSettings(nextSettings: AppSettings) {
  loadSettings();

  const updatedAt = new Date().toISOString();
  settings = {
    company: {
      ...settings.company,
      ...nextSettings.company,
      updated_at: updatedAt,
    },
    profile: {
      ...settings.profile,
      ...nextSettings.profile,
      updated_at: updatedAt,
    },
  };

  persistSettings();
  emitChange();

  return settings;
}

export function resetAppSettings() {
  settings = {
    company: { ...defaultSettings.company },
    profile: { ...defaultSettings.profile },
  };

  persistSettings();
  emitChange();

  return settings;
}

export function useAppSettings() {
  return useSyncExternalStore(subscribeAppSettings, getAppSettingsSnapshot, getDefaultAppSettings);
}
