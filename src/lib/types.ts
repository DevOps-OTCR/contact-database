export interface Contact {
  id: number;
  supabaseId?: number;
  name: string;
  company: string;
  role: string;
  email: string;
  altEmail: string;
  linkedin?: string;
  isOTCR: boolean;
  isUIUC: boolean;
  contactType: "OTCR & UIUC" | "OTCR Only" | "UIUC Only" | "Other";
  graduationYear?: number;
  major?: string;
  subMajor?: string;
  industry?: string;
}
