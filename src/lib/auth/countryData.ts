export interface Country {
  code: string;           // ISO 3166-1 alpha-2 (e.g., 'US')
  dialCode: string;       // E.164 format (e.g., '+1')
  name: string;           // Full country name
  flag: string;           // Emoji flag
  format: string;         // Phone format pattern
  priority?: number;      // For sorting (popular countries first)
}

// Popular countries for quick access
export const POPULAR_COUNTRIES = ['US', 'GB', 'CA', 'AU', 'IN', 'MX', 'DE', 'FR', 'ES', 'IT'];

// Cache for sorted countries to avoid repeated sorting
let sortedCountriesCache: Country[] | null = null;

export const COUNTRIES: Country[] = [
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸', format: '(###) ###-####', priority: 1 },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧', format: '#### ### ####', priority: 2 },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦', format: '(###) ###-####', priority: 3 },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺', format: '#### ### ###', priority: 4 },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳', format: '##### #####', priority: 5 },
  { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽', format: '### ### ####', priority: 6 },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪', format: '### ########', priority: 7 },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷', format: '# ## ## ## ##', priority: 8 },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸', format: '### ## ## ##', priority: 9 },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹', format: '### ### ####', priority: 10 },
  
  // Rest of the world (alphabetically)
  { code: 'AF', dialCode: '+93', name: 'Afghanistan', flag: '🇦🇫', format: '### ### ####' },
  { code: 'AL', dialCode: '+355', name: 'Albania', flag: '🇦🇱', format: '### ### ####' },
  { code: 'DZ', dialCode: '+213', name: 'Algeria', flag: '🇩🇿', format: '### ## ## ##' },
  { code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷', format: '### #### ####' },
  { code: 'AM', dialCode: '+374', name: 'Armenia', flag: '🇦🇲', format: '### ### ###' },
  { code: 'AT', dialCode: '+43', name: 'Austria', flag: '🇦🇹', format: '### ### ####' },
  { code: 'AZ', dialCode: '+994', name: 'Azerbaijan', flag: '🇦🇿', format: '### ### ## ##' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain', flag: '🇧🇭', format: '#### ####' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩', format: '#### ######' },
  { code: 'BY', dialCode: '+375', name: 'Belarus', flag: '🇧🇾', format: '### ### ## ##' },
  { code: 'BE', dialCode: '+32', name: 'Belgium', flag: '🇧🇪', format: '### ## ## ##' },
  { code: 'BZ', dialCode: '+501', name: 'Belize', flag: '🇧🇿', format: '### ####' },
  { code: 'BO', dialCode: '+591', name: 'Bolivia', flag: '🇧🇴', format: '### #####' },
  { code: 'BA', dialCode: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦', format: '### ### ###' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷', format: '### #### ####' },
  { code: 'BG', dialCode: '+359', name: 'Bulgaria', flag: '🇧🇬', format: '### ### ###' },
  { code: 'KH', dialCode: '+855', name: 'Cambodia', flag: '🇰🇭', format: '### ### ###' },
  { code: 'CM', dialCode: '+237', name: 'Cameroon', flag: '🇨🇲', format: '### ## ## ##' },
  { code: 'CL', dialCode: '+56', name: 'Chile', flag: '🇨🇱', format: '# #### ####' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳', format: '### #### ####' },
  { code: 'CO', dialCode: '+57', name: 'Colombia', flag: '🇨🇴', format: '### ### ####' },
  { code: 'CR', dialCode: '+506', name: 'Costa Rica', flag: '🇨🇷', format: '#### ####' },
  { code: 'HR', dialCode: '+385', name: 'Croatia', flag: '🇭🇷', format: '### ### ###' },
  { code: 'CU', dialCode: '+53', name: 'Cuba', flag: '🇨🇺', format: '### #####' },
  { code: 'CY', dialCode: '+357', name: 'Cyprus', flag: '🇨🇾', format: '#### ####' },
  { code: 'CZ', dialCode: '+420', name: 'Czech Republic', flag: '🇨🇿', format: '### ### ###' },
  { code: 'DK', dialCode: '+45', name: 'Denmark', flag: '🇩🇰', format: '## ## ## ##' },
  { code: 'DO', dialCode: '+1', name: 'Dominican Republic', flag: '🇩🇴', format: '(###) ###-####' },
  { code: 'EC', dialCode: '+593', name: 'Ecuador', flag: '🇪🇨', format: '### ### ###' },
  { code: 'EG', dialCode: '+20', name: 'Egypt', flag: '🇪🇬', format: '### ### ####' },
  { code: 'SV', dialCode: '+503', name: 'El Salvador', flag: '🇸🇻', format: '#### ####' },
  { code: 'EE', dialCode: '+372', name: 'Estonia', flag: '🇪🇪', format: '### ####' },
  { code: 'ET', dialCode: '+251', name: 'Ethiopia', flag: '🇪🇹', format: '### ### ####' },
  { code: 'FI', dialCode: '+358', name: 'Finland', flag: '🇫🇮', format: '### ### ####' },
  { code: 'GE', dialCode: '+995', name: 'Georgia', flag: '🇬🇪', format: '### ### ###' },
  { code: 'GH', dialCode: '+233', name: 'Ghana', flag: '🇬🇭', format: '### ### ####' },
  { code: 'GR', dialCode: '+30', name: 'Greece', flag: '🇬🇷', format: '### ### ####' },
  { code: 'GT', dialCode: '+502', name: 'Guatemala', flag: '🇬🇹', format: '#### ####' },
  { code: 'HN', dialCode: '+504', name: 'Honduras', flag: '🇭🇳', format: '#### ####' },
  { code: 'HK', dialCode: '+852', name: 'Hong Kong', flag: '🇭🇰', format: '#### ####' },
  { code: 'HU', dialCode: '+36', name: 'Hungary', flag: '🇭🇺', format: '### ### ###' },
  { code: 'IS', dialCode: '+354', name: 'Iceland', flag: '🇮🇸', format: '### ####' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩', format: '### #### ####' },
  { code: 'IR', dialCode: '+98', name: 'Iran', flag: '🇮🇷', format: '### ### ####' },
  { code: 'IQ', dialCode: '+964', name: 'Iraq', flag: '🇮🇶', format: '### ### ####' },
  { code: 'IE', dialCode: '+353', name: 'Ireland', flag: '🇮🇪', format: '### ### ####' },
  { code: 'IL', dialCode: '+972', name: 'Israel', flag: '🇮🇱', format: '### ### ####' },
  { code: 'JM', dialCode: '+1', name: 'Jamaica', flag: '🇯🇲', format: '(###) ###-####' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵', format: '### #### ####' },
  { code: 'JO', dialCode: '+962', name: 'Jordan', flag: '🇯🇴', format: '### ### ####' },
  { code: 'KZ', dialCode: '+7', name: 'Kazakhstan', flag: '🇰🇿', format: '### ### ## ##' },
  { code: 'KE', dialCode: '+254', name: 'Kenya', flag: '🇰🇪', format: '### ### ###' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait', flag: '🇰🇼', format: '#### ####' },
  { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan', flag: '🇰🇬', format: '### ### ###' },
  { code: 'LA', dialCode: '+856', name: 'Laos', flag: '🇱🇦', format: '### ## ### ###' },
  { code: 'LV', dialCode: '+371', name: 'Latvia', flag: '🇱🇻', format: '### ### ###' },
  { code: 'LB', dialCode: '+961', name: 'Lebanon', flag: '🇱🇧', format: '### ### ###' },
  { code: 'LY', dialCode: '+218', name: 'Libya', flag: '🇱🇾', format: '### ### ###' },
  { code: 'LT', dialCode: '+370', name: 'Lithuania', flag: '🇱🇹', format: '### ### ###' },
  { code: 'LU', dialCode: '+352', name: 'Luxembourg', flag: '🇱🇺', format: '### ### ###' },
  { code: 'MO', dialCode: '+853', name: 'Macau', flag: '🇲🇴', format: '#### ####' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾', format: '### ### ####' },
  { code: 'MV', dialCode: '+960', name: 'Maldives', flag: '🇲🇻', format: '### ####' },
  { code: 'MT', dialCode: '+356', name: 'Malta', flag: '🇲🇹', format: '#### ####' },
  { code: 'MU', dialCode: '+230', name: 'Mauritius', flag: '🇲🇺', format: '#### ####' },
  { code: 'MD', dialCode: '+373', name: 'Moldova', flag: '🇲🇩', format: '### ### ###' },
  { code: 'MC', dialCode: '+377', name: 'Monaco', flag: '🇲🇨', format: '## ## ## ## ##' },
  { code: 'MN', dialCode: '+976', name: 'Mongolia', flag: '🇲🇳', format: '#### ####' },
  { code: 'ME', dialCode: '+382', name: 'Montenegro', flag: '🇲🇪', format: '### ### ###' },
  { code: 'MA', dialCode: '+212', name: 'Morocco', flag: '🇲🇦', format: '### ### ###' },
  { code: 'MM', dialCode: '+95', name: 'Myanmar', flag: '🇲🇲', format: '### ### ####' },
  { code: 'NP', dialCode: '+977', name: 'Nepal', flag: '🇳🇵', format: '### ### ####' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱', format: '### ### ####' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿', format: '### ### ####' },
  { code: 'NI', dialCode: '+505', name: 'Nicaragua', flag: '🇳🇮', format: '#### ####' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria', flag: '🇳🇬', format: '### ### ####' },
  { code: 'NO', dialCode: '+47', name: 'Norway', flag: '🇳🇴', format: '### ## ###' },
  { code: 'OM', dialCode: '+968', name: 'Oman', flag: '🇴🇲', format: '#### ####' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰', format: '### ### ####' },
  { code: 'PS', dialCode: '+970', name: 'Palestine', flag: '🇵🇸', format: '### ### ###' },
  { code: 'PA', dialCode: '+507', name: 'Panama', flag: '🇵🇦', format: '#### ####' },
  { code: 'PY', dialCode: '+595', name: 'Paraguay', flag: '🇵🇾', format: '### ### ###' },
  { code: 'PE', dialCode: '+51', name: 'Peru', flag: '🇵🇪', format: '### ### ###' },
  { code: 'PH', dialCode: '+63', name: 'Philippines', flag: '🇵🇭', format: '#### ### ####' },
  { code: 'PL', dialCode: '+48', name: 'Poland', flag: '🇵🇱', format: '### ### ###' },
  { code: 'PT', dialCode: '+351', name: 'Portugal', flag: '🇵🇹', format: '### ### ###' },
  { code: 'PR', dialCode: '+1', name: 'Puerto Rico', flag: '🇵🇷', format: '(###) ###-####' },
  { code: 'QA', dialCode: '+974', name: 'Qatar', flag: '🇶🇦', format: '#### ####' },
  { code: 'RO', dialCode: '+40', name: 'Romania', flag: '🇷🇴', format: '### ### ###' },
  { code: 'RU', dialCode: '+7', name: 'Russia', flag: '🇷🇺', format: '### ### ## ##' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦', format: '### ### ####' },
  { code: 'RS', dialCode: '+381', name: 'Serbia', flag: '🇷🇸', format: '### ### ###' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬', format: '#### ####' },
  { code: 'SK', dialCode: '+421', name: 'Slovakia', flag: '🇸🇰', format: '### ### ###' },
  { code: 'SI', dialCode: '+386', name: 'Slovenia', flag: '🇸🇮', format: '### ### ###' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦', format: '### ### ####' },
  { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷', format: '### #### ####' },
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka', flag: '🇱🇰', format: '### ### ####' },
  { code: 'SE', dialCode: '+46', name: 'Sweden', flag: '🇸🇪', format: '### ### ###' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭', format: '### ### ###' },
  { code: 'SY', dialCode: '+963', name: 'Syria', flag: '🇸🇾', format: '### ### ###' },
  { code: 'TW', dialCode: '+886', name: 'Taiwan', flag: '🇹🇼', format: '#### ### ###' },
  { code: 'TJ', dialCode: '+992', name: 'Tajikistan', flag: '🇹🇯', format: '### ### ###' },
  { code: 'TZ', dialCode: '+255', name: 'Tanzania', flag: '🇹🇿', format: '### ### ###' },
  { code: 'TH', dialCode: '+66', name: 'Thailand', flag: '🇹🇭', format: '### ### ####' },
  { code: 'TN', dialCode: '+216', name: 'Tunisia', flag: '🇹🇳', format: '### ### ###' },
  { code: 'TR', dialCode: '+90', name: 'Turkey', flag: '🇹🇷', format: '### ### ####' },
  { code: 'TM', dialCode: '+993', name: 'Turkmenistan', flag: '🇹🇲', format: '### ### ###' },
  { code: 'UG', dialCode: '+256', name: 'Uganda', flag: '🇺🇬', format: '### ### ###' },
  { code: 'UA', dialCode: '+380', name: 'Ukraine', flag: '🇺🇦', format: '### ### ## ##' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪', format: '### ### ####' },
  { code: 'UY', dialCode: '+598', name: 'Uruguay', flag: '🇺🇾', format: '### ### ###' },
  { code: 'UZ', dialCode: '+998', name: 'Uzbekistan', flag: '🇺🇿', format: '### ### ###' },
  { code: 'VE', dialCode: '+58', name: 'Venezuela', flag: '🇻🇪', format: '### ### ####' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳', format: '### ### ####' },
  { code: 'YE', dialCode: '+967', name: 'Yemen', flag: '🇾🇪', format: '### ### ###' },
  { code: 'ZM', dialCode: '+260', name: 'Zambia', flag: '🇿🇲', format: '### ### ###' },
  { code: 'ZW', dialCode: '+263', name: 'Zimbabwe', flag: '🇿🇼', format: '### ### ####' },
];

/**
 * Get country by ISO code
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/**
 * Get country by dial code
 */
export function getCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find(c => c.dialCode === dialCode);
}

/**
 * Get sorted countries (popular first, then alphabetical)
 * Results are cached to avoid repeated sorting operations
 */
export function getSortedCountries(): Country[] {
  // Return cached result if available
  if (sortedCountriesCache) {
    return sortedCountriesCache;
  }
  
  // Sort and cache the result
  sortedCountriesCache = [...COUNTRIES].sort((a, b) => {
    if (a.priority && b.priority) return a.priority - b.priority;
    if (a.priority) return -1;
    if (b.priority) return 1;
    return a.name.localeCompare(b.name);
  });
  
  return sortedCountriesCache;
}

/**
 * Search countries by name or dial code
 */
export function searchCountries(query: string): Country[] {
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(
    c => c.name.toLowerCase().includes(lowerQuery) || 
         c.dialCode.includes(query) ||
         c.code.toLowerCase().includes(lowerQuery)
  );
}
