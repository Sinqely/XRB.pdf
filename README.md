# PDF-bagaren

Sätt ihop sidor ur flera PDF-filer, lägg på vattenstämpel och textetikett och spara resultatet, helt i webbläsaren. Inga filer lämnar datorn.

Appen levereras som en enda HTML-fil (`dist/index.html`) som läggs upp på SharePoint. Se [AGENTS.md](AGENTS.md) för kommandon och regler, och [docs/](docs/) för behov, krav, arkitektur, design och plan.

## Snabbstart för utveckling

```
npm ci
npm run dev        # öppna adressen som visas
npm test           # lint, tester, bygge, licenser och end-to-end
```

Den färdiga filen hamnar i `dist/index.html`. Den finns också som nedladdningsbar fil under varje körning i GitHub Actions (`pdf-bagaren-html`).

Version: se `package.json` och [CHANGELOG.md](CHANGELOG.md).
