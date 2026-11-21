/**
 * Reine Prüf- und Bereinigungsfunktionen ohne Zugriff auf das DOM.
 * Dadurch lassen sie sich automatisiert testen (siehe tests/).
 */
import { VEREIN, UEBERGABEARTEN, KLEIDUNGSARTEN, KRISENGEBIETE } from './config.js';

/** Buchstaben (inkl. Umlaute und Akzente), Leerzeichen, Bindestrich, Punkt, Apostroph. */
const NAME_MUSTER = /^[\p{L}][\p{L} .'-]*$/u;
/** Wie Name, zusätzlich Ziffern und Schrägstrich (z. B. „Straße des 17. Juni“). */
const STRASSE_MUSTER = /^[\p{L}0-9][\p{L}0-9 .'/-]*$/u;
const HAUSNUMMER_MUSTER = /^[0-9]{1,4}[ ]?[a-zA-Z]?$/;
const PLZ_MUSTER = /^[0-9]{5}$/;

/**
 * Bereinigt eine Texteingabe: Steuerzeichen entfernen, Leerraum zusammenfassen,
 * Ränder kürzen und auf eine Höchstlänge begrenzen.
 */
export function bereinige(wert, maxLaenge = 100) {
  if (typeof wert !== 'string') return '';
  return wert
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLaenge);
}

export function istGueltigePlz(plz) {
  return PLZ_MUSTER.test(plz);
}

/** Abholung nur, wenn die ersten beiden Ziffern mit der PLZ der Geschäftsstelle übereinstimmen. */
export function liegtImAbholgebiet(plz, vereinsPlz = VEREIN.plz) {
  return istGueltigePlz(plz) && plz.slice(0, 2) === vereinsPlz.slice(0, 2);
}

const istErlaubt = (liste, schluessel) => Object.hasOwn(liste, schluessel);

/**
 * Prüft die Rohdaten des Formulars.
 * @param {object} roh  Werte aus dem Formular (Strings bzw. String-Array für kleidung)
 * @returns {{ok: boolean, fehler: Object<string,string>, daten: object}}
 */
export function pruefeRegistrierung(roh) {
  const fehler = {};
  const daten = {
    uebergabe: bereinige(roh.uebergabe, 30),
    kleidung: Array.isArray(roh.kleidung) ? roh.kleidung.map((k) => bereinige(k, 30)) : [],
    krisengebiet: bereinige(roh.krisengebiet, 30),
  };

  if (!istErlaubt(UEBERGABEARTEN, daten.uebergabe)) {
    fehler.uebergabe = 'Bitte wählen Sie aus, wie die Kleidung übergeben wird.';
  }
  if (daten.kleidung.length === 0) {
    fehler.kleidung = 'Bitte wählen Sie mindestens eine Art von Kleidung aus.';
  } else if (!daten.kleidung.every((k) => istErlaubt(KLEIDUNGSARTEN, k))) {
    fehler.kleidung = 'Die Auswahl enthält eine unbekannte Kleidungsart.';
  }
  daten.kleidung = [...new Set(daten.kleidung)];
  if (!istErlaubt(KRISENGEBIETE, daten.krisengebiet)) {
    fehler.krisengebiet = 'Bitte wählen Sie ein Krisengebiet aus der Liste aus.';
  }

  if (daten.uebergabe === 'abholung') {
    const adresse = {
      name: bereinige(roh.name, 80),
      strasse: bereinige(roh.strasse, 100),
      hausnummer: bereinige(roh.hausnummer, 6),
      plz: bereinige(roh.plz, 5),
      ort: bereinige(roh.ort, 60),
    };
    if (adresse.name.length < 2 || !NAME_MUSTER.test(adresse.name)) {
      fehler.name = 'Bitte geben Sie einen gültigen Namen ein (nur Buchstaben, Leerzeichen, Bindestrich).';
    }
    if (adresse.strasse.length < 2 || !STRASSE_MUSTER.test(adresse.strasse)) {
      fehler.strasse = 'Bitte geben Sie eine gültige Straße ein.';
    }
    if (!HAUSNUMMER_MUSTER.test(adresse.hausnummer)) {
      fehler.hausnummer = 'Bitte geben Sie eine gültige Hausnummer ein, z. B. 12 oder 12a.';
    }
    if (!istGueltigePlz(adresse.plz)) {
      fehler.plz = 'Die Postleitzahl muss aus genau fünf Ziffern bestehen.';
    } else if (!liegtImAbholgebiet(adresse.plz)) {
      fehler.plz = `Diese Adresse liegt außerhalb unseres Abholgebiets (PLZ ${VEREIN.plz.slice(0, 2)}xxx). Bitte bringen Sie die Spende zur Geschäftsstelle.`;
    }
    if (adresse.ort.length < 2 || !NAME_MUSTER.test(adresse.ort)) {
      fehler.ort = 'Bitte geben Sie einen gültigen Ort ein.';
    }
    daten.adresse = adresse;
  }

  return { ok: Object.keys(fehler).length === 0, fehler, daten };
}

/** Ermittelt den Ort der Übergabe für die Bestätigung. */
export function ortDerUebergabe(daten) {
  if (daten.uebergabe === 'abholung' && daten.adresse) {
    const a = daten.adresse;
    return `${a.name}, ${a.strasse} ${a.hausnummer}, ${a.plz} ${a.ort}`;
  }
  return `${VEREIN.name}, ${VEREIN.strasse}, ${VEREIN.plz} ${VEREIN.ort}`;
}
