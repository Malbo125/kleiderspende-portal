# Kleidernetz e. V. – Portal zur Registrierung von Kleiderspenden

Fallstudie im Kurs **IPWA01-01 Programmierung von Webanwendungsoberflächen** (IU Internationale Hochschule), Aufgabenstellung 3 „Kleiderspenden-Registrierung“. Verein, Adressen und Daten sind fiktiv.

## Funktionen

| Anforderung | Umsetzung |
|---|---|
| Titel und Logo | Logo als SVG (`img/logo.svg`), Vereinsname im Header |
| Header mit globaler Navigation, Content, Footer mit rechtlichen Hinweisen | auf allen Seiten, Footer mit Impressum und Datenschutz |
| Responsiv | Bootstrap-5-Grid, Navigation klappt auf Smartphones ein, größere Bedienelemente auf Tablets |
| Formular zur Registrierung | `registrierung.html` |
| Übergabe an der Geschäftsstelle | nur Kleidungsart und Krisengebiet nötig |
| Abholung | zusätzlich Abholadresse |
| PLZ-Prüfung | erste zwei Ziffern müssen mit der PLZ der Geschäftsstelle (34117) übereinstimmen |
| Bestätigungsseite | `bestaetigung.html` mit Kleidungsart, Krisengebiet, Datum, Uhrzeit und Ort |
| Schutz vor Code-Injection | Whitelist-Validierung, Ausgabe nur über `textContent`, Content Security Policy, keine Inline-Skripte |

## Technik

- HTML5, CSS3, JavaScript (ES-Module), ohne Build-Schritt
- [Bootstrap 5.3.3](https://getbootstrap.com/) lokal eingebunden (`vendor/`), keine Anfragen an Drittanbieter
- Keine Serverkomponente: Die Registrierung wird für die Bestätigungsseite im `sessionStorage` abgelegt

## Struktur

```
index.html            Startseite
registrierung.html    Formular
bestaetigung.html     Bestätigung
impressum.html, datenschutz.html
css/style.css         eigene Gestaltung
js/config.js          Verein, Kleidungsarten, Krisengebiete (Whitelists)
js/validierung.js     Prüfregeln (ohne DOM, testbar)
js/registrierung.js   Formularlogik
js/bestaetigung.js    Ausgabe der Bestätigung
tests/                automatisierte Tests der Prüfregeln
```

## Live-Version

https://malbo125.github.io/kleiderspende-portal/

## Lokal starten und testen

```bash
python3 -m http.server 8080     # danach http://localhost:8080 öffnen
npm test                        # Tests mit Node.js 20+
```

Wegen der ES-Module muss die Seite über einen Webserver geöffnet werden, nicht per Doppelklick.
