import { KLEIDUNGSARTEN, KRISENGEBIETE, UEBERGABEARTEN, SPEICHER_SCHLUESSEL } from './config.js';
import { pruefeRegistrierung, ortDerUebergabe } from './validierung.js';

/** Liest die Registrierung und prüft sie erneut: Der sessionStorage ist durch Nutzende veränderbar. */
function ladeRegistrierung() {
  try {
    const roh = JSON.parse(sessionStorage.getItem(SPEICHER_SCHLUESSEL));
    if (!roh || typeof roh !== 'object') return null;
    const { ok, daten } = pruefeRegistrierung({ ...roh, ...(roh.adresse ?? {}) });
    const zeitpunkt = new Date(roh.zeitpunkt);
    if (!ok || Number.isNaN(zeitpunkt.getTime())) return null;
    const nummer = /^[0-9A-F]{8}$/.test(roh.nummer) ? roh.nummer : '';
    return { ...daten, zeitpunkt, nummer };
  } catch {
    return null;
  }
}

function zeile(liste, begriff, wert) {
  const dt = document.createElement('dt');
  dt.className = 'col-sm-4';
  dt.textContent = begriff;
  const dd = document.createElement('dd');
  dd.className = 'col-sm-8';
  dd.textContent = wert; // textContent statt innerHTML: kein HTML/Script wird ausgeführt
  liste.append(dt, dd);
}

const r = ladeRegistrierung();
if (!r) {
  document.getElementById('keine-daten').classList.remove('d-none');
} else {
  const datum = r.zeitpunkt.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const uhrzeit = r.zeitpunkt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  document.getElementById('bestaetigung-text').textContent = r.uebergabe === 'abholung'
    ? 'Ihre Abholung ist registriert. Unser Sammelfahrzeug meldet sich bei Ihnen.'
    : 'Ihre Spende ist registriert. Bitte geben Sie die Kleidung jetzt an der Annahme ab.';
  if (r.nummer) document.getElementById('registriernummer').textContent = `Nr. ${r.nummer}`;

  const liste = document.getElementById('zusammenfassung');
  zeile(liste, 'Übergabe', UEBERGABEARTEN[r.uebergabe]);
  zeile(liste, 'Art der Kleidung', r.kleidung.map((k) => KLEIDUNGSARTEN[k]).join(', '));
  zeile(liste, 'Krisengebiet', KRISENGEBIETE[r.krisengebiet]);
  zeile(liste, 'Datum', datum);
  zeile(liste, 'Uhrzeit', `${uhrzeit} Uhr`);
  zeile(liste, r.uebergabe === 'abholung' ? 'Abholort' : 'Ort der Übergabe', ortDerUebergabe(r));

  document.getElementById('bestaetigung').classList.remove('d-none');
  document.title = `Bestätigung Nr. ${r.nummer} | Kleidernetz e. V.`;
}

document.getElementById('drucken').addEventListener('click', () => window.print());
document.getElementById('neue-spende').addEventListener('click', () => sessionStorage.removeItem(SPEICHER_SCHLUESSEL));
