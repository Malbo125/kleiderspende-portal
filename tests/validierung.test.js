import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bereinige, liegtImAbholgebiet, pruefeRegistrierung, ortDerUebergabe } from '../js/validierung.js';

const basis = { kleidung: ['winter'], krisengebiet: 'ukraine' };
const adresse = { name: 'Erika Mustermann', strasse: 'Hauptstraße', hausnummer: '5a', plz: '34121', ort: 'Kassel' };

test('Übergabe an der Geschäftsstelle braucht keine Adresse', () => {
  const r = pruefeRegistrierung({ ...basis, uebergabe: 'geschaeftsstelle' });
  assert.equal(r.ok, true);
  assert.equal(r.daten.adresse, undefined);
  assert.match(ortDerUebergabe(r.daten), /Lindenallee 12/);
});

test('Abholung mit gültiger Adresse im Abholgebiet', () => {
  const r = pruefeRegistrierung({ ...basis, ...adresse, uebergabe: 'abholung' });
  assert.equal(r.ok, true);
  assert.equal(ortDerUebergabe(r.daten), 'Erika Mustermann, Hauptstraße 5a, 34121 Kassel');
});

test('Abholung ohne Adresse wird abgelehnt', () => {
  const r = pruefeRegistrierung({ ...basis, uebergabe: 'abholung' });
  assert.equal(r.ok, false);
  for (const feld of ['name', 'strasse', 'hausnummer', 'plz', 'ort']) assert.ok(r.fehler[feld], feld);
});

test('PLZ-Prüfung: die ersten zwei Ziffern müssen übereinstimmen', () => {
  assert.equal(liegtImAbholgebiet('34117'), true);
  assert.equal(liegtImAbholgebiet('34999'), true);
  assert.equal(liegtImAbholgebiet('35037'), false);
  assert.equal(liegtImAbholgebiet('3411'), false);
  assert.equal(liegtImAbholgebiet('34a17'), false);
  const r = pruefeRegistrierung({ ...basis, ...adresse, plz: '10115', uebergabe: 'abholung' });
  assert.match(r.fehler.plz, /außerhalb/);
});

test('Pflichtauswahl: Kleidungsart und Krisengebiet', () => {
  const r = pruefeRegistrierung({ uebergabe: 'geschaeftsstelle', kleidung: [], krisengebiet: '' });
  assert.ok(r.fehler.kleidung);
  assert.ok(r.fehler.krisengebiet);
});

test('Nur Werte aus der Whitelist werden akzeptiert', () => {
  const r = pruefeRegistrierung({ uebergabe: 'teleport', kleidung: ['<img src=x onerror=alert(1)>'], krisengebiet: '__proto__' });
  assert.ok(r.fehler.uebergabe);
  assert.ok(r.fehler.kleidung);
  assert.ok(r.fehler.krisengebiet);
});

test('Code-Injection in Textfeldern wird abgelehnt', () => {
  const angriffe = ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', 'javascript:alert(1)', 'Max{{7*7}}'];
  for (const a of angriffe) {
    const r = pruefeRegistrierung({ ...basis, ...adresse, name: a, strasse: a, ort: a, uebergabe: 'abholung' });
    assert.ok(r.fehler.name && r.fehler.strasse && r.fehler.ort, a);
  }
});

test('Umlaute, Bindestriche und Akzente sind in Namen erlaubt', () => {
  const r = pruefeRegistrierung({ ...basis, ...adresse, name: "Jörg-André O'Neill", strasse: 'Straße des 17. Juni', uebergabe: 'abholung' });
  assert.equal(r.ok, true);
});

test('bereinige entfernt Steuerzeichen, Leerraum und kürzt', () => {
  assert.equal(bereinige('  Erika \n\t Mustermann\u0000 '), 'Erika Mustermann');
  assert.equal(bereinige('x'.repeat(200), 10).length, 10);
  assert.equal(bereinige(undefined), '');
});
