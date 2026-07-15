/** Countries supported in GuardOps site forms (Australia & New Zealand). */
export const SITE_COUNTRIES: Record<string, string[]> = {
  Australia: [
    "Australian Capital Territory",
    "New South Wales",
    "Northern Territory",
    "Queensland",
    "South Australia",
    "Tasmania",
    "Victoria",
    "Western Australia",
  ],
  "New Zealand": [
    "Auckland",
    "Bay of Plenty",
    "Canterbury",
    "Gisborne",
    "Hawke's Bay",
    "Manawatū-Whanganui",
    "Marlborough",
    "Nelson",
    "Northland",
    "Otago",
    "Southland",
    "Taranaki",
    "Tasman",
    "Waikato",
    "Wellington",
    "West Coast",
  ],
};

export const SITE_COUNTRY_OPTIONS = Object.keys(SITE_COUNTRIES);

/** Shorthand codes still accepted when matching seed / legacy data. */
export const AU_STATE_CODES: Record<string, string> = {
  ACT: "Australian Capital Territory",
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  SA: "South Australia",
  TAS: "Tasmania",
  VIC: "Victoria",
  WA: "Western Australia",
};
