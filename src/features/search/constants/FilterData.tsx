// ── Filter data ───────────────────────────────────────────────────────────────

import { FilterOption } from "@/components/nav/FilterDropdown";

export const GENRE_OPTIONS: FilterOption[] = [
  { label: 'Electronic',    value: 'electronic' },
  { label: 'Hip-hop & Rap', value: 'hip-hop'    },
  { label: 'R&B & Soul',    value: 'rnb'        },
  { label: 'Pop',           value: 'pop'        },
  { label: 'Rock',          value: 'rock'       },
  { label: 'Classical',     value: 'classical'  },
  { label: 'Jazz & Blues',  value: 'jazz'       },
  { label: 'Dance & EDM',   value: 'dance'      },
  { label: 'Ambient',       value: 'ambient'    },
];

export const DATE_OPTIONS: FilterOption[] = [
  { label: 'Added any time', value: ''     },
  { label: 'Past hour',      value: '1h'   },
  { label: 'Past day',       value: '1d'   },
  { label: 'Past week',      value: '7d'   },
  { label: 'Past month',     value: '30d'  },
  { label: 'Past year',      value: '365d' },
];

export const LENGTH_OPTIONS: FilterOption[] = [
  { label: 'Any length',  value: ''      },
  { label: 'Short (<2m)', value: 'short' },
  { label: 'Medium',      value: 'med'   },
  { label: 'Long (>10m)', value: 'long'  },
];
