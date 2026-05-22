"use client";

import { useSyncExternalStore } from "react";
import { companySettings as defaultCompanySettings, profile as defaultProfile } from "@/services/mock-data";
import type { CompanySettings, Profile } from "@/types/business";

export interface AppSettings {
  company: CompanySettings;
  companies: CompanySettings[];
  profile: Profile;
  selectedCompanyId: string | null;
}

const storageKey = "nexo_app_settings";
const listeners = new Set<() => void>();

function cloneCompany(company: CompanySettings) {
  return { ...company };
}

function createDefaultSettings(): AppSettings {
  const defaultCompany = cloneCompany(defaultCompanySettings);

  return {
    company: defaultCompany,
    companies: [defaultCompany],
    profile: { ...defaultProfile },
    selectedCompanyId: null,
  };
}

const defaultSettings = createDefaultSettings();

let settings: AppSettings = defaultSettings;
let loaded = false;
let storageListenerInstalled = false;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeCompany(company?: Partial<CompanySettings> | null): CompanySettings {
  return {
    ...defaultCompanySettings,
    ...(company ?? {}),
    id: company?.id ?? `company-${Date.now()}`,
    user_id: company?.user_id ?? defaultProfile.user_id,
    nit: company?.nit ?? company?.identificacion ?? defaultCompanySettings.nit,
    razon_social: company?.razon_social ?? company?.nombre_empresa ?? defaultCompanySettings.razon_social,
    tipo_razon_social: company?.tipo_razon_social ?? defaultCompanySettings.tipo_razon_social,
    tipo_identificacion: company?.tipo_identificacion ?? defaultCompanySettings.tipo_identificacion,
    digito_verificacion: company?.digito_verificacion ?? defaultCompanySettings.digito_verificacion,
    actividad_economica: company?.actividad_economica ?? defaultCompanySettings.actividad_economica,
    responsabilidades_fiscales: company?.responsabilidades_fiscales ?? defaultCompanySettings.responsabilidades_fiscales,
    tributos: company?.tributos ?? defaultCompanySettings.tributos,
  };
}

function uniqueCompanies(companies: CompanySettings[]) {
  const seen = new Set<string>();
  return companies.filter((company) => {
    const key = company.id || company.nit || company.identificacion;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeSettings(value: unknown): AppSettings {
  const candidate = value as Partial<AppSettings> | null;
  const previousCompany = normalizeCompany(candidate?.company);
  const candidateCompanies = Array.isArray(candidate?.companies)
    ? candidate.companies.map((company) => normalizeCompany(company))
    : [previousCompany];
  const companies = uniqueCompanies(candidateCompanies.length ? candidateCompanies : [previousCompany]);
  const selectedCompanyId =
    candidate?.selectedCompanyId && companies.some((company) => company.id === candidate.selectedCompanyId)
      ? candidate.selectedCompanyId
      : null;
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId) ?? companies[0] ?? previousCompany;

  return {
    company: selectedCompany,
    companies,
    profile: {
      ...defaultProfile,
      ...(candidate?.profile ?? {}),
    },
    selectedCompanyId,
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

function commitSettings(nextSettings: AppSettings) {
  settings = nextSettings;
  persistSettings();
  emitChange();
  return settings;
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

export function selectCompany(companyId: string) {
  loadSettings();

  const selectedCompany = settings.companies.find((company) => company.id === companyId);
  if (!selectedCompany) return settings;

  return commitSettings({
    ...settings,
    company: selectedCompany,
    selectedCompanyId: selectedCompany.id,
  });
}

export function clearSelectedCompany() {
  loadSettings();

  return commitSettings({
    ...settings,
    company: settings.companies[0] ?? normalizeCompany(defaultCompanySettings),
    selectedCompanyId: null,
  });
}

export function createCompany(company: CompanySettings) {
  loadSettings();

  const now = new Date().toISOString();
  const normalizedCompany = normalizeCompany({
    ...company,
    id: company.id || `company-${Date.now()}`,
    created_at: company.created_at || now,
    updated_at: now,
  });
  const duplicate = settings.companies.find(
    (item) =>
      item.id === normalizedCompany.id ||
      item.nit.trim().toLowerCase() === normalizedCompany.nit.trim().toLowerCase() ||
      item.identificacion.trim().toLowerCase() === normalizedCompany.identificacion.trim().toLowerCase(),
  );
  const companies = duplicate
    ? settings.companies.map((item) => (item.id === duplicate.id ? { ...normalizedCompany, id: duplicate.id } : item))
    : [normalizedCompany, ...settings.companies];
  const selectedCompany = duplicate ? companies.find((item) => item.id === duplicate.id) ?? normalizedCompany : normalizedCompany;

  return commitSettings({
    ...settings,
    company: selectedCompany,
    companies,
    selectedCompanyId: selectedCompany.id,
  });
}

export function saveAppSettings(nextSettings: Pick<AppSettings, "company" | "profile"> & Partial<AppSettings>) {
  loadSettings();

  const updatedAt = new Date().toISOString();
  const selectedCompanyId = settings.selectedCompanyId ?? nextSettings.selectedCompanyId ?? nextSettings.company.id;
  const companyToSave = normalizeCompany({
    ...settings.company,
    ...nextSettings.company,
    id: selectedCompanyId,
    updated_at: updatedAt,
  });
  const companies = settings.companies.some((company) => company.id === companyToSave.id)
    ? settings.companies.map((company) => (company.id === companyToSave.id ? companyToSave : company))
    : [companyToSave, ...settings.companies];

  return commitSettings({
    company: companyToSave,
    companies,
    profile: {
      ...settings.profile,
      ...nextSettings.profile,
      updated_at: updatedAt,
    },
    selectedCompanyId: companyToSave.id,
  });
}

export function resetAppSettings() {
  return commitSettings(defaultSettings);
}

export function useAppSettings() {
  return useSyncExternalStore(subscribeAppSettings, getAppSettingsSnapshot, getDefaultAppSettings);
}
