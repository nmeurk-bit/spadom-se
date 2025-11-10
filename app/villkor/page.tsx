// app/villkor/page.tsx
export default function VillkorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-white mb-8">
        Användarvillkor
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-gray-200">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Allmänt</h2>
          <p>
            Dessa användarvillkor ("Villkoren") reglerar din användning av Spådom.se ("Tjänsten"), 
            som drivs av [Företagsnamn] ("vi", "oss", "vår"). Genom att använda Tjänsten accepterar 
            du dessa Villkor i sin helhet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Tjänstebeskrivning</h2>
          <p>
            Spådom.se erbjuder AI-genererade spådomar för underhållning och reflektion. Våra spådomar
            är inte avsedda som medicinsk, juridisk, finansiell eller professionell rådgivning.
            Innehållet är genererat av artificiell intelligens och ska betraktas som underhållning.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Köp och betalning</h2>
          <p>
            Betalningar sker via Stripe, en tredjepartstjänst för säkra betalningar. Vi lagrar inte 
            dina kortuppgifter. Alla priser anges i svenska kronor (SEK) och inkluderar moms där det 
            är tillämpligt.
          </p>
          <p>
            När du köper spådomar får du krediter som läggs till ditt konto. Varje spådom kostar 1 
            kredit. Krediter förfaller inte men kan inte överföras eller återbetalas enligt vår 
            återbetalningspolicy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Användaransvar</h2>
          <p>
            Du ansvarar för att:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hålla dina inloggningsuppgifter säkra</li>
            <li>Inte dela ditt konto med andra</li>
            <li>Inte använda Tjänsten för olagliga ändamål</li>
            <li>Inte försöka kringgå våra säkerhetsåtgärder</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Immateriella rättigheter</h2>
          <p>
            Allt innehåll på Spådom.se, inklusive men inte begränsat till text, grafik, logotyper och 
            kod, ägs av oss eller våra licensgivare och är skyddat av upphovsrättslagar.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Ansvarsbegränsning</h2>
          <p>
            Tjänsten tillhandahålls "som den är" utan några garantier. Vi ansvarar inte för:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Beslut du fattar baserat på spådomar</li>
            <li>Tekniska problem eller avbrott i tjänsten</li>
            <li>Förlust av data eller innehåll</li>
            <li>Direkta eller indirekta skador till följd av användning av Tjänsten</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Ändring av villkor</h2>
          <p>
            Vi förbehåller oss rätten att ändra dessa Villkor när som helst. Ändringar träder i kraft 
            omedelbart vid publicering på webbplatsen. Din fortsatta användning av Tjänsten efter 
            ändringar innebär att du accepterar de nya Villkoren.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Tillämplig lag</h2>
          <p>
            Dessa Villkor ska tolkas och tillämpas i enlighet med svensk lag. Eventuella tvister ska 
            lösas i svensk domstol.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Kontakt</h2>
          <p>
            Vid frågor om dessa Villkor, kontakta oss på support@spadom.se
          </p>
        </section>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
        </p>
      </div>
    </div>
  );
}
