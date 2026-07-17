# Akeneo Companion — Installatie & Auto-updates

## Eenmalige installatie (collega's)

Na deze eenmalige installatie worden toekomstige updates **automatisch door Chrome geïnstalleerd**.

### Stap 1 — Download het `.crx` bestand

Ga naar de [nieuwste release](https://github.com/KrijnErmerins/akeneo-companion/releases/latest) en download `akeneo-companion.crx`.

### Stap 2 — Installeer de extensie

1. Open Chrome en ga naar `chrome://extensions`
2. Zet **Ontwikkelaarsmodus** aan (rechtsboven)
3. Sleep het gedownloade `.crx` bestand naar het `chrome://extensions` tabblad
4. Klik op **Extensie toevoegen** in de bevestigingsdialoog

De extensie heeft na installatie altijd **extensie-ID `migofmlkogajdnkkclldmgajanlamnmm`**.

> **Opmerking:** Chrome kan een waarschuwing tonen dat de extensie niet uit de Chrome Web Store komt. Dit is normaal voor interne extensies — klik door om te installeren.

### Stap 3 — Verwijder eventuele oude installatie

Als je de extensie eerder via "Unpacked laden" hebt geïnstalleerd:
1. Verwijder die installatie via `chrome://extensions`
2. De nieuwe `.crx` installatie vervangt deze volledig

---

## Auto-updates

Chrome controleert automatisch op updates via de `update_url` in het manifest. Updates worden op de achtergrond gedownload en geïnstalleerd. Geen actie vereist.

Wil je een update direct forceren?
1. Ga naar `chrome://extensions`
2. Klik op het verversicoon (⟳) bovenaan de pagina

---

## Voor beheerders — GitHub Secret instellen

De release-pipeline vereist één GitHub Secret om `.crx` bestanden te signeren:

1. Kopieer de inhoud van `key.pem` (bewaard op een veilige plek buiten de repo)
2. Ga naar **GitHub → Settings → Secrets and variables → Actions**
3. Voeg een secret toe met naam `CRX_KEY_PEM` en plak de volledige PEM-inhoud

De PEM-sleutel geeft de extensie zijn stabiele ID. Verlies hem niet — zonder de sleutel kunnen bestaande installaties niet meer worden bijgewerkt.
