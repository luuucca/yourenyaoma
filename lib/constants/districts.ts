// 维也纳 23 个邮编区
export const DISTRICTS = [
  { id: '1010', label: '1010 Innere Stadt（内城）' },
  { id: '1020', label: '1020 Leopoldstadt（利奥波德城）' },
  { id: '1030', label: '1030 Landstraße' },
  { id: '1040', label: '1040 Wieden' },
  { id: '1050', label: '1050 Margareten' },
  { id: '1060', label: '1060 Mariahilf' },
  { id: '1070', label: '1070 Neubau' },
  { id: '1080', label: '1080 Josefstadt' },
  { id: '1090', label: '1090 Alsergrund' },
  { id: '1100', label: '1100 Favoriten' },
  { id: '1110', label: '1110 Simmering' },
  { id: '1120', label: '1120 Meidling' },
  { id: '1130', label: '1130 Hietzing' },
  { id: '1140', label: '1140 Penzing' },
  { id: '1150', label: '1150 Rudolfsheim-Fünfhaus' },
  { id: '1160', label: '1160 Ottakring' },
  { id: '1170', label: '1170 Hernals' },
  { id: '1180', label: '1180 Währing' },
  { id: '1190', label: '1190 Döbling' },
  { id: '1200', label: '1200 Brigittenau' },
  { id: '1210', label: '1210 Floridsdorf' },
  { id: '1220', label: '1220 Donaustadt' },
  { id: '1230', label: '1230 Liesing' },
] as const

export type DistrictId = (typeof DISTRICTS)[number]['id']
export const DISTRICT_LABEL: Record<string, string> = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, d.label]),
)
