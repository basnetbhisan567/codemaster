import { create } from 'zustand';

interface CertificationStore {
  latestCertification: any | null;
}

export const useCertificationStore = create<CertificationStore>(() => ({
  latestCertification: null,
}));