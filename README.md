# 📈 Addiction Ticker

**Näe tarkalleen, mitä nikotiiniriippuvuutesi todella maksaa — ja mihin se raha voisi kasvaa, jos sijoittaisit sen.**

Reaaliaikainen taloudellinen seurantatyökalu, joka tekee näkymättömän hintalapun näkyväksi.

## Tekniikka

- **Frontend:** React + TypeScript + Vite + TailwindCSS v4
- **iOS:** Capacitor 8 (SPM, ei CocoaPods)
- **CI/CD:** GitHub Actions → App Store Connect → TestFlight
- **Tiedon tallennus:** 100 % offline, localStorage

## Kehitys

```bash
npm install
npm run dev
```

## iOS-build

iOS-build tapahtuu automaattisesti GitHub Actionsin kautta jokaisella `git push`:lla.
Katso [`TESTFLIGHT_OHJE.md`](./TESTFLIGHT_OHJE.md) lisätietoja varten.

## Lisenssi

Yksityinen projekti. Kaikki oikeudet pidätetään.
