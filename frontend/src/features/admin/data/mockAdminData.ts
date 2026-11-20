export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'BORROWER_MICRO' | 'BORROWER_GROWTH' | 'LENDER_OFFICER' | 'LENDER_MANAGER' | 'SUPER_ADMIN' | 'ETHICS_AUDITOR';
  organization: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastActive: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  category: 'AUTH' | 'CONSENT_REVOCATION' | 'SANCTION_DECISION' | 'HAIRCUT_OVERRIDE' | 'SECURITY';
  ipAddress: string;
  status: 'SUCCESS' | 'FLAGGED' | 'BLOCKED';
  details: string;
}

export interface ConnectorTelemetryItem {
  name: string;
  displayName: string;
  protocol: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  latencyMs: number;
  uptime30d: number;
  circuitBreakerTripped: boolean;
}

export const mockAdminUsers: AdminUserItem[] = [
  { id: 'usr_01', name: 'Ramesh Kumar', email: 'ramesh.balaji@gmail.com', mobile: '+91 98451 23890', role: 'BORROWER_MICRO', organization: 'Sri Balaji Provisions', status: 'ACTIVE', lastActive: '10 mins ago' },
  { id: 'usr_02', name: 'Priya Sharma', email: 'priya@artisankraft.in', mobile: '+91 97112 84910', role: 'BORROWER_GROWTH', organization: 'ArtisanKraft Studio', status: 'ACTIVE', lastActive: '2 hours ago' },
  { id: 'usr_03', name: 'Muthuvel Pandian', email: 'pandian.brass@rediffmail.com', mobile: '+91 94431 82901', role: 'BORROWER_MICRO', organization: 'Pandian Brass Works', status: 'ACTIVE', lastActive: 'Yesterday' },
  { id: 'usr_04', name: 'Vikram Deshmukh', email: 'vikram.d@pragatifin.in', mobile: '+91 98200 45123', role: 'LENDER_OFFICER', organization: 'Pragati FinServe NBFC', status: 'ACTIVE', lastActive: 'Just now' },
  { id: 'usr_05', name: 'Ananya Sen', email: 'ananya.sen@utkarshsfb.in', mobile: '+91 99300 78219', role: 'LENDER_MANAGER', organization: 'Utkarsh Small Finance Bank', status: 'ACTIVE', lastActive: '15 mins ago' },
  { id: 'usr_06', name: 'Rajiv Mehta', email: 'rajiv.m@udyoga.fin.in', mobile: '+91 98190 32190', role: 'SUPER_ADMIN', organization: 'UDYOGA Core Platform', status: 'ACTIVE', lastActive: 'Just now' },
  { id: 'usr_07', name: 'Dr. Sunita Rao', email: 'dr.sunita@fairlendingcouncil.org', mobile: '+91 98400 91823', role: 'ETHICS_AUDITOR', organization: 'Independent Fair Lending Council', status: 'ACTIVE', lastActive: '1 hour ago' },
];

export const mockAuditLogs: AuditLogItem[] = [
  { id: 'AUD-89101', timestamp: '2026-11-20 10:15:32 IST', actorId: 'usr_04', actorName: 'Vikram Deshmukh', action: 'SANCTION_APPROVED', category: 'SANCTION_DECISION', ipAddress: '14.139.128.45', status: 'SUCCESS', details: 'Sanction letter issued for Sri Balaji Provisions (₹1,50,000) with daily sweep covenant.' },
  { id: 'AUD-89102', timestamp: '2026-11-20 10:02:18 IST', actorId: 'usr_01', actorName: 'Ramesh Kumar', action: 'DPDP_CONSENT_GRANTED', category: 'CONSENT_REVOCATION', ipAddress: '106.51.72.19', status: 'SUCCESS', details: 'Authorized Sahamati Account Aggregator token (aa_sbi_4892).' },
  { id: 'AUD-89103', timestamp: '2026-11-20 09:45:00 IST', actorId: 'usr_07', actorName: 'Dr. Sunita Rao', action: 'FAIRNESS_AUDIT_EXPORT', category: 'SECURITY', ipAddress: '115.240.90.12', status: 'SUCCESS', details: 'Exported quarterly 80% Rule Disparate Impact Ratio certification pack.' },
  { id: 'AUD-89104', timestamp: '2026-11-20 08:30:12 IST', actorId: 'usr_04', actorName: 'Vikram Deshmukh', action: 'HAIRCUT_MODIFIED', category: 'HAIRCUT_OVERRIDE', ipAddress: '14.139.128.45', status: 'SUCCESS', details: 'Applied 10% risk haircut to facility APP-2026-0895 due to high buyer concentration.' },
  { id: 'AUD-89105', timestamp: '2026-11-20 07:12:45 IST', actorId: 'anon_ip', actorName: 'System Gatekeeper', action: 'RATE_LIMIT_BURST', category: 'AUTH', ipAddress: '185.220.101.4', status: 'FLAGGED', details: 'Blocked 25 rapid OTP requests from unrecognized proxy subnet.' },
  { id: 'AUD-89106', timestamp: '2026-11-19 18:20:10 IST', actorId: 'usr_02', actorName: 'Priya Sharma', action: 'DPDP_CONSENT_REVOKED', category: 'CONSENT_REVOCATION', ipAddress: '49.36.12.88', status: 'SUCCESS', details: 'Revoked legacy utility BBPS consent handle. Background polling stopped.' },
];

export const mockConnectors: ConnectorTelemetryItem[] = [
  { name: 'SAHAMATI_AA', displayName: 'Sahamati Account Aggregator (FIP/FIU)', protocol: 'ReBIT v1.3 HTTPS', status: 'OPERATIONAL', latencyMs: 310, uptime30d: 99.98, circuitBreakerTripped: false },
  { name: 'GSTN_GATEWAY', displayName: 'Goods & Services Tax Network (GSTN)', protocol: 'GSP REST API', status: 'DEGRADED', latencyMs: 1240, uptime30d: 98.40, circuitBreakerTripped: false },
  { name: 'NPCI_UPI', displayName: 'NPCI UPI AutoPay & Dynamic QR', protocol: 'NPCI 2.0 Gateway', status: 'OPERATIONAL', latencyMs: 180, uptime30d: 99.99, circuitBreakerTripped: false },
  { name: 'DIGILOCKER', displayName: 'DigiLocker Entity Identity Vault', protocol: 'UIDAI/MeitY OAuth', status: 'OPERATIONAL', latencyMs: 240, uptime30d: 99.85, circuitBreakerTripped: false },
];
