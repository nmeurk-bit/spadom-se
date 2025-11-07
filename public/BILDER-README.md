# Bilder för Spådommen.se

Denna fil beskriver vilka bilder som behöver laddas upp till `/public/`-mappen för att sidan ska fungera korrekt.

## Obligatoriska bilder

### Ikoner för "Så fungerar det"-sektionen

Placera följande ikonfiler direkt i `/public/`:

1. **ikon-vem.png** - Ikon för steg 1: "Välj vem spådomen gäller"
   - Rekommenderad storlek: 128x128px eller högre
   - Används i: `components/HowItWorks.tsx`

2. **ikon-kategori.png** - Ikon för steg 2: "Välj kategori"
   - Rekommenderad storlek: 128x128px eller högre
   - Används i: `components/HowItWorks.tsx`

3. **ikon-fraga.png** - Ikon för steg 3: "Skriv din fråga"
   - Rekommenderad storlek: 128x128px eller högre
   - Används i: `components/HowItWorks.tsx`

4. **ikon-vand.png** - Ikon för steg 4: "Vänd kortet"
   - Rekommenderad storlek: 128x128px eller högre
   - Används i: `components/HowItWorks.tsx`

5. **ikon-historik.png** - Ikon för steg 5: "Din historik & saldo"
   - Rekommenderad storlek: 128x128px eller högre
   - Används i: `components/HowItWorks.tsx`

### Tarotkort-baksida

Placera följande fil direkt i `/public/`:

6. **tarot-back.png** - Baksidan av tarotkortet som visas i hero-sektionen
   - Rekommenderad storlek: 400x600px (eller annat kortformat)
   - Används i: `components/HeroTarotCard.tsx`
   - Detta är den sida som användaren ser INNAN de vänder kortet

## Filstruktur

```
/public/
├── ikon-vem.png
├── ikon-kategori.png
├── ikon-fraga.png
├── ikon-vand.png
├── ikon-historik.png
├── tarot-back.png
├── logo-spadommen.png (finns redan)
└── hero-tarot.jpg (finns redan)
```

## Att ladda upp bilder

1. Navigera till `/public/`-mappen i ditt projekt
2. Ladda upp de 6 filerna listade ovan
3. Säkerställ att filnamnen är exakt som angivet (små bokstäver, bindestreck)
4. Commit och pusha ändringarna till GitHub
5. Vercel kommer automatiskt att bygga om sidan med de nya bilderna

## Bildformat och optimering

- **Format**: PNG rekommenderas för ikoner (transparent bakgrund)
- **Storlek**: Håll filstorleken under 100KB per ikon för bästa prestanda
- **Optimering**: Använd verktyg som TinyPNG eller ImageOptim för att komprimera bilderna

## Troubleshooting

Om bilderna inte visas:
1. Kontrollera att filnamnen är exakt rätt (case-sensitive)
2. Kontrollera att bilderna ligger direkt i `/public/`, inte i en undermapp
3. Rensa Next.js cache: `rm -rf .next && npm run build`
4. Kontrollera webbläsarens konsol för felmeddelanden

## Status

- [ ] ikon-vem.png
- [ ] ikon-kategori.png
- [ ] ikon-fraga.png
- [ ] ikon-vand.png
- [ ] ikon-historik.png
- [ ] tarot-back.png

När alla bilder är uppladdade, markera dem som klara ovan.
