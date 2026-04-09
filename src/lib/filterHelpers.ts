import { Contact } from "./types";

// Major categories
export const MAJOR_CATEGORIES = [
  "Engineering (Mechanical, Electrical, Civil, Aerospace, etc.)",
  "Computer Science / Computer Engineering",
  "Business (Finance, Accounting, Marketing, Supply Chain)",
  "Economics",
  "Mathematics / Statistics",
  "Data Science / Information Sciences",
  "Sciences (Physics, Chemistry, Bio)",
  "Pre-Med / Health Sciences",
  "Political Science / Public Policy",
  "Communications",
  "Other",
] as const;

// Role categories
export const ROLE_CATEGORIES = [
  "Strategy",
  "Management Consulting",
  "Product Management",
  "Engineering",
  "Data / Analytics",
  "Finance",
  "Operations",
  "Marketing / Growth",
  "Sales / Business Development",
  "Corporate Development / M&A",
  "Investment (PE / VC / IB)",
  "Healthcare Clinical",
  "Policy / Government",
  "Founder / Entrepreneur",
  "General Management",
  "Other",
] as const;

// Industry categories
export const INDUSTRY_CATEGORIES = [
  "Consulting",
  "Technology",
  "Healthcare",
  "Financial Services",
  "Private Equity / Venture Capital",
  "Manufacturing",
  "Energy",
  "Consumer Goods / Retail",
  "Aerospace / Defense",
  "Real Estate",
  "Transportation / Logistics",
  "Government / Public Sector",
  "Nonprofit",
  "Education",
  "Media / Entertainment",
  "Other",
] as const;

// Alumni status options
export const ALUMNI_STATUS_OPTIONS = [
  "OTCR Alum",
  "UIUC Alum",
  "Other",
] as const;

// Generate graduation years from 1999 to 2025
export const GRADUATION_YEARS = Array.from({ length: 27 }, (_, i) => 1999 + i);

/**
 * Categorize a major into a primary category
 */
export function categorizeMajor(major?: string): string {
  if (!major) return "Other";
  
  const majorLower = major.toLowerCase();
  
  // Engineering
  if (
    majorLower.includes("mechanical") ||
    majorLower.includes("electrical") ||
    majorLower.includes("civil") ||
    majorLower.includes("aerospace") ||
    majorLower.includes("industrial") ||
    majorLower.includes("materials") ||
    majorLower.includes("chemical") ||
    majorLower.includes("biomedical") ||
    majorLower.includes("nuclear")
  ) {
    return "Engineering (Mechanical, Electrical, Civil, Aerospace, etc.)";
  }
  
  // Computer Science / Computer Engineering
  if (
    majorLower.includes("computer science") ||
    majorLower.includes("computer engineering") ||
    majorLower.includes("cs") ||
    majorLower.includes("ce")
  ) {
    return "Computer Science / Computer Engineering";
  }
  
  // Business
  if (
    majorLower.includes("business") ||
    majorLower.includes("finance") ||
    majorLower.includes("accounting") ||
    majorLower.includes("marketing") ||
    majorLower.includes("supply chain") ||
    majorLower.includes("management")
  ) {
    return "Business (Finance, Accounting, Marketing, Supply Chain)";
  }
  
  // Economics
  if (majorLower.includes("economics") || majorLower.includes("econ")) {
    return "Economics";
  }
  
  // Mathematics / Statistics
  if (
    majorLower.includes("mathematics") ||
    majorLower.includes("math") ||
    majorLower.includes("statistics") ||
    majorLower.includes("stat")
  ) {
    return "Mathematics / Statistics";
  }
  
  // Data Science / Information Sciences
  if (
    majorLower.includes("data science") ||
    majorLower.includes("information science") ||
    majorLower.includes("information systems")
  ) {
    return "Data Science / Information Sciences";
  }
  
  // Sciences
  if (
    majorLower.includes("physics") ||
    majorLower.includes("chemistry") ||
    majorLower.includes("biology") ||
    majorLower.includes("bio")
  ) {
    return "Sciences (Physics, Chemistry, Bio)";
  }
  
  // Pre-Med / Health Sciences
  if (
    majorLower.includes("pre-med") ||
    majorLower.includes("premed") ||
    majorLower.includes("health") ||
    majorLower.includes("medicine")
  ) {
    return "Pre-Med / Health Sciences";
  }
  
  // Political Science / Public Policy
  if (
    majorLower.includes("political science") ||
    majorLower.includes("public policy") ||
    majorLower.includes("poli sci")
  ) {
    return "Political Science / Public Policy";
  }
  
  // Communications
  if (majorLower.includes("communication") || majorLower.includes("comm")) {
    return "Communications";
  }
  
  return "Other";
}

/**
 * Categorize a role into a category
 */
export function categorizeRole(role?: string): string {
  if (!role) return "Other";
  
  const roleLower = role.toLowerCase();
  
  // Strategy
  if (roleLower.includes("strategy") || roleLower.includes("strategist")) {
    return "Strategy";
  }
  
  // Management Consulting
  if (
    roleLower.includes("management consultant") ||
    roleLower.includes("consultant") ||
    roleLower.includes("consulting")
  ) {
    return "Management Consulting";
  }
  
  // Product Management
  if (
    roleLower.includes("product manager") ||
    roleLower.includes("product management") ||
    roleLower.includes("pm")
  ) {
    return "Product Management";
  }
  
  // Engineering
  if (
    roleLower.includes("engineer") ||
    roleLower.includes("engineering") ||
    roleLower.includes("software engineer") ||
    roleLower.includes("developer")
  ) {
    return "Engineering";
  }
  
  // Data / Analytics
  if (
    roleLower.includes("data") ||
    roleLower.includes("analytics") ||
    roleLower.includes("analyst") ||
    roleLower.includes("data scientist")
  ) {
    return "Data / Analytics";
  }
  
  // Finance
  if (
    roleLower.includes("finance") ||
    roleLower.includes("financial") ||
    roleLower.includes("accountant") ||
    roleLower.includes("cfo")
  ) {
    return "Finance";
  }
  
  // Operations
  if (
    roleLower.includes("operations") ||
    roleLower.includes("operational") ||
    roleLower.includes("ops")
  ) {
    return "Operations";
  }
  
  // Marketing / Growth
  if (
    roleLower.includes("marketing") ||
    roleLower.includes("growth") ||
    roleLower.includes("brand")
  ) {
    return "Marketing / Growth";
  }
  
  // Sales / Business Development
  if (
    roleLower.includes("sales") ||
    roleLower.includes("business development") ||
    roleLower.includes("bd")
  ) {
    return "Sales / Business Development";
  }
  
  // Corporate Development / M&A
  if (
    roleLower.includes("corporate development") ||
    roleLower.includes("m&a") ||
    roleLower.includes("mergers") ||
    roleLower.includes("acquisitions")
  ) {
    return "Corporate Development / M&A";
  }
  
  // Investment (PE / VC / IB)
  if (
    roleLower.includes("private equity") ||
    roleLower.includes("venture capital") ||
    roleLower.includes("investment banking") ||
    roleLower.includes("pe") ||
    roleLower.includes("vc") ||
    roleLower.includes("ib") ||
    roleLower.includes("investor")
  ) {
    return "Investment (PE / VC / IB)";
  }
  
  // Healthcare Clinical
  if (
    roleLower.includes("clinical") ||
    roleLower.includes("physician") ||
    roleLower.includes("doctor") ||
    roleLower.includes("nurse")
  ) {
    return "Healthcare Clinical";
  }
  
  // Policy / Government
  if (
    roleLower.includes("policy") ||
    roleLower.includes("government") ||
    roleLower.includes("public sector")
  ) {
    return "Policy / Government";
  }
  
  // Founder / Entrepreneur
  if (
    roleLower.includes("founder") ||
    roleLower.includes("entrepreneur") ||
    roleLower.includes("ceo") ||
    roleLower.includes("co-founder")
  ) {
    return "Founder / Entrepreneur";
  }
  
  // General Management
  if (
    roleLower.includes("manager") ||
    roleLower.includes("director") ||
    roleLower.includes("vp") ||
    roleLower.includes("vice president") ||
    roleLower.includes("general manager")
  ) {
    return "General Management";
  }
  
  return "Other";
}

/**
 * Categorize an industry into a category
 */
export function categorizeIndustry(industry?: string): string {
  if (!industry) return "Other";
  
  const industryLower = industry.toLowerCase();
  
  // Consulting
  if (industryLower.includes("consulting")) {
    return "Consulting";
  }
  
  // Technology
  if (
    industryLower.includes("technology") ||
    industryLower.includes("tech") ||
    industryLower.includes("software") ||
    industryLower.includes("saas")
  ) {
    return "Technology";
  }
  
  // Healthcare
  if (
    industryLower.includes("healthcare") ||
    industryLower.includes("health") ||
    industryLower.includes("medical") ||
    industryLower.includes("pharmaceutical")
  ) {
    return "Healthcare";
  }
  
  // Financial Services
  if (
    industryLower.includes("financial services") ||
    industryLower.includes("banking") ||
    industryLower.includes("finance")
  ) {
    return "Financial Services";
  }
  
  // Private Equity / Venture Capital
  if (
    industryLower.includes("private equity") ||
    industryLower.includes("venture capital") ||
    industryLower.includes("pe") ||
    industryLower.includes("vc")
  ) {
    return "Private Equity / Venture Capital";
  }
  
  // Manufacturing
  if (industryLower.includes("manufacturing")) {
    return "Manufacturing";
  }
  
  // Energy
  if (industryLower.includes("energy") || industryLower.includes("oil") || industryLower.includes("gas")) {
    return "Energy";
  }
  
  // Consumer Goods / Retail
  if (
    industryLower.includes("consumer goods") ||
    industryLower.includes("retail") ||
    industryLower.includes("consumer")
  ) {
    return "Consumer Goods / Retail";
  }
  
  // Aerospace / Defense
  if (
    industryLower.includes("aerospace") ||
    industryLower.includes("defense") ||
    industryLower.includes("defence")
  ) {
    return "Aerospace / Defense";
  }
  
  // Real Estate
  if (industryLower.includes("real estate") || industryLower.includes("realty")) {
    return "Real Estate";
  }
  
  // Transportation / Logistics
  if (
    industryLower.includes("transportation") ||
    industryLower.includes("logistics") ||
    industryLower.includes("shipping")
  ) {
    return "Transportation / Logistics";
  }
  
  // Government / Public Sector
  if (
    industryLower.includes("government") ||
    industryLower.includes("public sector")
  ) {
    return "Government / Public Sector";
  }
  
  // Nonprofit
  if (industryLower.includes("nonprofit") || industryLower.includes("non-profit")) {
    return "Nonprofit";
  }
  
  // Education
  if (industryLower.includes("education") || industryLower.includes("university")) {
    return "Education";
  }
  
  // Media / Entertainment
  if (
    industryLower.includes("media") ||
    industryLower.includes("entertainment") ||
    industryLower.includes("publishing")
  ) {
    return "Media / Entertainment";
  }
  
  return "Other";
}

/**
 * Get alumni status from contact
 */
export function getAlumniStatus(contact: Contact): string {
  if (contact.isOTCR && contact.isUIUC) {
    return "OTCR Alum"; // If both, prioritize OTCR
  }
  if (contact.isOTCR) {
    return "OTCR Alum";
  }
  if (contact.isUIUC) {
    return "UIUC Alum";
  }
  return "Other";
}

/**
 * Get unique values for a filter category from contacts
 */
export function getFilterValues(contacts: Contact[], category: string): string[] {
  const values = new Set<string>();
  
  contacts.forEach((contact) => {
    let value: string | undefined;
    
    switch (category) {
      case "major":
        value = contact.major ? categorizeMajor(contact.major) : undefined;
        break;
      case "role":
        value = categorizeRole(contact.role);
        break;
      case "industry":
        value = contact.industry ? categorizeIndustry(contact.industry) : undefined;
        break;
      case "company":
        value = contact.company || undefined;
        break;
      case "alumniStatus":
        value = getAlumniStatus(contact);
        break;
      case "graduationYear":
        value = contact.graduationYear ? String(contact.graduationYear) : undefined;
        break;
    }
    
    if (value) {
      values.add(value);
    }
  });
  
  return Array.from(values).sort();
}
