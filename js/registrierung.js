import { KLEIDUNGSARTEN, KRISENGEBIETE, UEBERGABEARTEN, SPEICHER_SCHLUESSEL } from './config.js';
import { pruefeRegistrierung, liegtImAbholgebiet, istGueltigePlz } from './validierung.js';

const formular = document.getElementById('spendenformular');
const adressBlock = document.getElementById('abholadresse');
const zusammenfassung = document.getElementById('fehler-zusammenfassung');
const plzFeld = document.getElementById('plz');

/** Optionen aus der Konfiguration erzeugen (per DOM-API, nie per innerHTML). */
function baueOptionen() {
  const gruppe = document.getElementById('kleidung-gruppe');
  for (const [wert, text] of Object.entries(KLEIDUNGSARTEN)) {
    const spalte = document.createElement('div');
    spalte.className = 'col';
    const box = document.createElement('div');
    box.className = 'form-check kleidung-option';
    const input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'checkbox';
    input.name = 'kleidung';
    input.id = `kleidung-${wert}`;
    input.value = wert;
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = input.id;
    label.textContent = text;
    box.append(input, label);
    spalte.append(box);
    gruppe.append(spalte);
  }
  const auswahl = document.getElementById('krisengebiet');
  for (const [wert, text] of Object.entries(KRISENGEBIETE)) {
    auswahl.add(new Option(text, wert));
  }
}

/** Abholadresse nur bei „Abholung“ anzeigen; deaktivierte Felder werden nicht mitgesendet. */
function aktualisiereUebergabe() {
  const abholung = formular.elements.uebergabe.value === 'abholung';
  adressBlock.classList.toggle('d-none', !abholung);
  adressBlock.disabled = !abholung;
  document.querySelectorAll('.schritt-nr').forEach((el, i) => {
    el.textContent = String(i + (abholung ? 3 : 2));
  });
}

/** Sofort-Rückmeldung zur PLZ, sobald fünf Ziffern eingegeben sind. */
function pruefePlzLive() {
  const plz = plzFeld.value.trim();
  if (!istGueltigePlz(plz)) {
    setzeFeldfehler('plz', '');
    return;
  }
  setzeFeldfehler('plz', liegtImAbholgebiet(plz)
    ? ''
    : 'Diese Adresse liegt außerhalb unseres Abholgebiets (PLZ 34xxx). Bitte bringen Sie die Spende zur Geschäftsstelle.');
  if (liegtImAbholgebiet(plz)) plzFeld.classList.add('is-valid');
}

function setzeFeldfehler(feld, meldung) {
  const fehlerEl = document.getElementById(`${feld}-fehler`);
  if (fehlerEl) fehlerEl.textContent = meldung;
  const eingabe = document.getElementById(feld);
  if (eingabe) {
    eingabe.classList.toggle('is-invalid', Boolean(meldung));
    eingabe.classList.remove('is-valid');
    eingabe.setAttribute('aria-invalid', meldung ? 'true' : 'false');
  }
}

function zeigeFehler(fehler) {
  const felder = ['uebergabe', 'name', 'strasse', 'hausnummer', 'plz', 'ort', 'kleidung', 'krisengebiet'];
  felder.forEach((f) => setzeFeldfehler(f, fehler[f] ?? ''));

  zusammenfassung.replaceChildren();
  const anzahl = Object.keys(fehler).length;
  if (anzahl === 0) {
    zusammenfassung.classList.add('d-none');
    return;
  }
  const titel = document.createElement('p');
  titel.className = 'fw-semibold mb-1';
  titel.textContent = anzahl === 1 ? 'Bitte korrigieren Sie 1 Angabe:' : `Bitte korrigieren Sie ${anzahl} Angaben:`;
  const liste = document.createElement('ul');
  liste.className = 'mb-0';
  for (const meldung of Object.values(fehler)) {
    const li = document.createElement('li');
    li.textContent = meldung;
    liste.append(li);
  }
  zusammenfassung.append(titel, liste);
  zusammenfassung.classList.remove('d-none');
  zusammenfassung.focus();
}

function sammleEingaben() {
  const fd = new FormData(formular);
  return {
    uebergabe: fd.get('uebergabe') ?? '',
    kleidung: fd.getAll('kleidung'),
    krisengebiet: fd.get('krisengebiet') ?? '',
    name: fd.get('name') ?? '',
    strasse: fd.get('strasse') ?? '',
    hausnummer: fd.get('hausnummer') ?? '',
    plz: fd.get('plz') ?? '',
    ort: fd.get('ort') ?? '',
  };
}

function absenden(ereignis) {
  ereignis.preventDefault();
  const { ok, fehler, daten } = pruefeRegistrierung(sammleEingaben());
  zeigeFehler(fehler);
  if (!ok) return;

  const registrierung = {
    ...daten,
    nummer: crypto.randomUUID().slice(0, 8).toUpperCase(),
    zeitpunkt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(registrierung));
  } catch {
    zeigeFehler({ speicher: 'Die Registrierung konnte nicht gespeichert werden. Bitte erlauben Sie die Speicherung im Browser.' });
    return;
  }
  window.location.assign('bestaetigung.html');
}

/** Vorauswahl über den Link der Startseite, z. B. ?uebergabe=geschaeftsstelle (nur erlaubte Werte). */
function uebernehmeVorauswahl() {
  const wert = new URLSearchParams(window.location.search).get('uebergabe');
  if (wert && Object.hasOwn(UEBERGABEARTEN, wert)) {
    document.getElementById(`uebergabe-${wert}`).checked = true;
  }
}

baueOptionen();
uebernehmeVorauswahl();
aktualisiereUebergabe();
formular.addEventListener('change', (e) => { if (e.target.name === 'uebergabe') aktualisiereUebergabe(); });
plzFeld.addEventListener('input', pruefePlzLive);
formular.addEventListener('submit', absenden);
