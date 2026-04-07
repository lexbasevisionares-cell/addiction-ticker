# 📱 Addiction Ticker — TestFlight-ohje

> **Tekoäly: Lue tämä tiedosto kokonaan ennen kuin aloitat TestFlight-prosessin käyttäjän kanssa.**
> Tämä dokumentti kuvaa koko polun siitä, kun koodi on GitHubissa, siihen että sovellus on käyttäjän omassa iPhonessa TestFlightin kautta.

---

## 🎯 Päätavoite — ✅ SAAVUTETTU (6.4.2026)

Addiction Ticker -sovellus on onnistuneesti asennettu käyttäjän iPhoneen TestFlightin kautta.

- Käyttäjällä on **vain Windows-tietokone** — ei Macia.
- Build tapahtuu **pilvessä GitHub Actionsin kautta** (macos-latest runner).
- Latausputki on rakennettu ja **toimii**: `.github/workflows/ios-build.yml`.
- Uudet versiot lähtevät iPhoneen automaattisesti jokaisen `git push` -komennon jälkeen.

---

## 🏗️ Projektin tekniset tiedot

- **Bundle ID:** `com.lexbase.addictionticker`
- **Team ID:** `P2DXDN482G`
- **App Store Connect App ID:** `6761534960`
- **Tekniikka:** React + TypeScript + Vite + Capacitor 8 (SPM, ei CocoaPods)
- **Xcode-projekti:** `ios/App/App.xcodeproj` (ei xcworkspace)
- **Build-putki:** `.github/workflows/ios-build.yml`
  - Build-numero haetaan automaattisesti `github.run_number`:sta ✅
  - Sertifikaatit asennetaan putkessa GitHub Secretseistä ✅
  - Upload tehdään `xcrun altool` + App Store Connect API -avaimella ✅

---

## ✅ Kaikki vaiheet suoritettu

### VAIHE 1: Sertifikaatin luominen — ✅ TEHTY (5.4.2026)
- CSR luotu Windows-koneessa OpenSSL:llä
- Apple Distribution -sertifikaatti luotu (voimassa 5.4.2027 asti)
- Muunnettu .cer → .pem → .p12 → base64
- P12-salasana: tallennettu GitHub Secretsiin

### VAIHE 2: Provisioning Profiilin luominen — ✅ TEHTY (5–6.4.2026)
- App Store -tyyppinen profiili luotu nimellä `AddictionTicker_AppStoreProfile`
- Päivitetty 6.4.2026 sisältämään oikea (5.4. luotu) sertifikaatti
- Muunnettu base64-muotoon ja tallennettu GitHub Secretsiin

### VAIHE 3: App Store Connect API -avaimen luominen — ✅ TEHTY (5.4.2026)
- API-avain `GitHubActions` luotu (Key ID: `4U3VFJSD6H`)
- Rooli: App Manager
- Issuer ID: `36256fe9-6402-4abf-9590-ab2971fc09aa`
- .p8-tiedosto muunnettu base64-muotoon ja tallennettu GitHub Secretsiin

### VAIHE 4: GitHub Secrets — ✅ KAIKKI 10 ASETETTU (6.4.2026)

| Secret-nimi | Status |
|---|---|
| `BUILD_CERTIFICATE_BASE64` | ✅ Asetettu |
| `P12_PASSWORD` | ✅ Asetettu |
| `BUILD_PROVISION_PROFILE_BASE64` | ✅ Asetettu (päivitetty 6.4.) |
| `KEYCHAIN_PASSWORD` | ✅ Asetettu |
| `APPLE_TEAM_ID` | ✅ Asetettu |
| `APP_BUNDLE_ID` | ✅ Asetettu |
| `APP_PROVISIONING_PROFILE_NAME` | ✅ Asetettu |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | ✅ Asetettu |
| `APP_STORE_CONNECT_API_KEY_ID` | ✅ Asetettu |
| `APP_STORE_CONNECT_API_KEY_BASE64` | ✅ Asetettu |

### VAIHE 5: Ensimmäinen build — ✅ ONNISTUI (6.4.2026)
- Build #15 (Trigger iOS Deployment): ❌ Epäonnistui — provisioning profile sisälsi väärän sertifikaatin
- Build #16 (Fix: Updated provisioning profile): ✅ Onnistui! (2min 1s)
- Sovellus ladattu App Store Connectiin: Version 1.0, Build 1

### VAIHE 6: TestFlight-asennus iPhoneen — ✅ TEHTY (6.4.2026)
- Encryption compliance: "None of the algorithms" ✅
- **Automatisoitu:** `ITSAppUsesNonExemptEncryption = false` lisätty `Info.plist`-tiedostoon (7.4.2026) — jatkossa compliance hoituu automaattisesti, ei vaadi manuaalista hyväksyntää.
- Testaajaryhmä "Testaajat" luotu ✅
- Käyttäjä (touko.aunio@icloud.com) kutsuttu ja hyväksytty ✅
- Sovellus asennettu iPhoneen TestFlightin kautta ✅

---

## 🔄 Uuden version julkaiseminen (jatkossa)

Kun haluat päivittää sovellusta, prosessi on nyt automaattinen:

```powershell
# Tee muutokset koodiin, sitten:
cd "C:\Users\Touko Aunio\.gemini\antigravity\scratch\addiction_ticker"
git add -A
git commit -m "kuvaus muutoksista"
git push origin main
```

GitHub käynnistää automaattisesti buildin. Uusi versio ilmestyy TestFlightiin ~10–20 minuutin kuluttua. Avaa TestFlight iPhonessa ja päivitä sovellus.

---

## 🔍 Vianetsintäohjeet (yleisimmät ongelmat)

| Ongelma | Todennäköinen syy | Ratkaisu |
|---|---|---|
| Build epäonnistuu "code signing" -virheeseen | Provisioning Profile tai sertifikaatti väärä/vanhentunut | Päivitä profiili Apple Developer Portalissa, lataa uusi, konvertoi base64, päivitä GitHub Secret |
| Build epäonnistuu "authentication" -virheeseen | API-avain väärä tai kopioitu väärin | Tarkista API Key GitHub Secretsissä |
| Sovellus ei näy TestFlightissa | Apple prosessoi vielä | Odota 30 min, tarkista App Store Connect |
| "Invalid build number" -virhe | Build-numero jo käytössä | Ei pitäisi tapahtua — build-numero on nyt `github.run_number` ✅ |
| "Provisioning profile not found" | Profiilin nimi ei täsmää | Tarkista `APP_PROVISIONING_PROFILE_NAME` = `AddictionTicker_AppStoreProfile` |
| Provisioning profile ei sisällä sertifikaattia | Profiili luotu eri sertifikaatilla | Muokkaa profiilia Developer Portalissa, valitse oikea sertifikaatti (5.4.2027), lataa uudelleen |
| "Missing Compliance" App Store Connectissa | `ITSAppUsesNonExemptEncryption` puuttuu Info.plististä | Lisätty 7.4.2026 — ei pitäisi enää tapahtua. Jos tapahtuu: Manage → None of the algorithms → Save |

---

## 📸 Kuvakaappaukset App Storea varten

Sovellus on nyt iPhonessa. Kuvakaappausten ottaminen:
1. Avaa sovellus ja navigoi halutulle näkymälle
2. Paina **sivupainike + äänenvoimakkuus ylös** samanaikaisesti → kuvakaappaus
3. Tarvittavat koot App Store Connectia varten:
   - **6.7" iPhone** (iPhone 15 Pro Max, 16 Plus) — pakollinen
   - **5.5" iPhone** (iPhone 8 Plus) — pakollinen
   - Jos omassa puhelimessa on 6.7" näyttö, riittää yksi setti (Apple hyväksyy skaalauksen)

---

*Luotu: 5. huhtikuuta 2026*
*Viimeksi päivitetty: 7. huhtikuuta 2026, klo 09:27*
