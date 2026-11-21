/**
 * Zentrale Konfiguration des Portals.
 * Alle Daten sind fiktiv und dienen nur der Fallstudie.
 * Die Listen sind bewusst als Whitelist angelegt: Das Formular akzeptiert
 * ausschließlich Werte, die hier hinterlegt sind.
 */
export const VEREIN = Object.freeze({
  name: 'Kleidernetz e. V.',
  strasse: 'Lindenallee 12',
  plz: '34117',
  ort: 'Kassel',
});

export const UEBERGABEARTEN = Object.freeze({
  geschaeftsstelle: 'Übergabe an der Geschäftsstelle',
  abholung: 'Abholung durch das Sammelfahrzeug',
});

export const KLEIDUNGSARTEN = Object.freeze({
  damen: 'Damenbekleidung',
  herren: 'Herrenbekleidung',
  kinder: 'Kinderbekleidung',
  baby: 'Babykleidung',
  winter: 'Winterjacken und -mäntel',
  schuhe: 'Schuhe',
});

export const KRISENGEBIETE = Object.freeze({
  ukraine: 'Ukraine',
  sudan: 'Sudan',
  syrien: 'Syrien',
  afghanistan: 'Afghanistan',
  haiti: 'Haiti',
});

/** Schlüssel, unter dem die letzte Registrierung im sessionStorage liegt. */
export const SPEICHER_SCHLUESSEL = 'kleidernetz:registrierung';
