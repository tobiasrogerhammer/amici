# Amici (frontend-demo)

Klikkbar demo av Amici for IØ2000, gruppe 22. Alt kjører i nettleseren og bruker demodata fra JSON-filer, uten backend.

## Kjør lokalt

```bash
cd amici
npm install
npm run dev
```

Åpne http://localhost:5173. Siden er laget mobile-first. På en stor skjerm vises den i en telefonramme.

## Det som er med

- **Oppdag:** swipe til høyre (venn) eller venstre (nei takk), eller bruk knappene. Forslagene sorteres etter felles interesser og filtreres på profilfiltrene.
- **Match:** profiler med `likesYou: true` i `profiles.json` gir match. Da vises AMICI MATCH-animasjonen. Den lukkes med krysset oppe til venstre eller ved å trykke på en fane i menyen.
- **Grupper:** for hver andre match lages det automatisk en gruppechat. Gruppa får tre forslag til arrangementer basert på interessene medlemmene har felles.
- **Chats:** gruppechatter og enkeltchatter, med isbryter og automatiske demosvar.
- **Arrangementer:** arrangementer i byen og grupper på appen som har ledige plasser.
- **Profil:** velg interesser og enkle filtre (alder, campus, språk og minste antall felles interesser). Nederst kan demoen nullstilles.

Tilstanden lagres i nettleserens `localStorage`. Bruk «Nullstill demo» på profilen for å starte på nytt.

## Demodata (`src/data`)

| Fil | Innhold |
|---|---|
| `interests.json` | Interesser, kategorier, campuser og språk |
| `me.json` | Din profil, startinteresser og filtre |
| `profiles.json` | 30 profiler. `likesYou: true` betyr at personen har likt deg tilbake |
| `events.json` | Arrangementer i byen (`kind: official`) og fra grupper (`kind: group`). `dayOffset` er antall dager fra i dag |
| `chats.json` | Eksisterende chatter, gruppenavn og farger, isbrytere og demosvar |

Alle personer, meldinger og arrangementer er oppdiktet. Avatarene er illustrasjoner som lages lokalt (stilen Notionists av Zoish, CC0).

## Farger

Paletten følger gruppas designvalg og er sjekket mot WCAG 2.2 AA: hovedfarge pastellblå `#A8C8EC` med mørkebrun tekst, mørk blå `#2E5C8A` til kontroller, skoggrønn `#2F7D4F` på «legg til venn», Dutch White `#FCEEC9`, hvit, mørkebrun `#2B2420`, dempet brun `#6B5F57`. Match-skjermen bruker også pastellblått med mørk tekst. Valgte filtre og den aktive fanen markeres også med ikon eller form, ikke bare med farge.
