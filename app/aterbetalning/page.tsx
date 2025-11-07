// app/aterbetalning/page.tsx
export default function AterbetalningPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-white mb-8">
        Återbetalningspolicy
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-gray-200">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Allmänt</h2>
          <p>
            Denna återbetalningspolicy beskriver villkoren för återbetalning av köp gjorda på Spådom.se. 
            Genom att köpa våra tjänster accepterar du denna policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Ångerrätt (14 dagar)</h2>
          <p>
            Enligt distansavtalslagen har du som konsument 14 dagars ångerrätt från köpdatum. 
            <strong> Observera dock att ångerrätten upphör om du börjar använda tjänsten innan ångerfristen löpt ut.</strong>
          </p>
          <p>
            Det innebär att om du köper spådomar och sedan beställer en spådom (använder en kredit), 
            så går du miste om ångerrätten för hela köpet. Detta enligt distansavtalslagen 
            (distansavtalslag 17 §).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Återbetalning vid oanvända krediter</h2>
          <p>
            Om du inte har använt någon av dina köpta spådomar och ångrar dig inom 14 dagar, 
            kan du begära full återbetalning. Kontakta oss på support@spadom.se med ditt köp-ID 
            och din e-postadress.
          </p>
          <p>
            Återbetalning sker till samma betalningsmetod som användes vid köpet och behandlas 
            inom 14 dagar från att vi mottagit din begäran.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Ingen återbetalning vid delvis användning</h2>
          <p>
            Om du har använt minst en spådom från ditt köpta paket, kan vi tyvärr inte erbjuda 
            återbetalning. Detta eftersom tjänsten är digital och har börjat levereras.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Återbetalning vid tekniska problem</h2>
          <p>
            Om du upplever tekniska problem som förhindrar dig från att använda tjänsten, kontakta 
            oss omedelbart på support@spadom.se. Vi kommer att undersöka problemet och, om det är 
            på vår sida, erbjuda lämplig kompensation eller återbetalning.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Kvalitetsgaranti</h2>
          <p>
            Vi strävar efter att leverera högkvalitativa AI-genererade spådomar. Om du är missnöjd 
            med kvaliteten på en spådom, kontakta oss inom 7 dagar efter leverans. Vi kan då:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Erbjuda en ny spådom utan extra kostnad</li>
            <li>Ge dig en kredit tillbaka till ditt konto</li>
          </ul>
          <p>
            Observera att spådomar är subjektiva och genereras av AI för underhållningsändamål. 
            Vi kan inte garantera att du kommer att vara nöjd med innehållet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Förlorade eller stulna krediter</h2>
          <p>
            Om ditt konto har äventyrats och krediter har använts utan ditt samtycke, kontakta oss 
            omedelbart på support@spadom.se. Vi kommer att undersöka situationen och vidta lämpliga 
            åtgärder.
          </p>
          <p>
            Du ansvarar för att hålla dina inloggningsuppgifter säkra. Vi kan inte alltid erbjuda 
            återbetalning för krediter som använts från ditt konto om vi inte kan verifiera att 
            obehörig åtkomst har skett.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Betalningstvister</h2>
          <p>
            Vid tvister om betalningar (t.ex. dubbeldebitering), kontakta oss först på 
            support@spadom.se. Om du inte är nöjd med vår hantering kan du kontakta:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Allmänna reklamationsnämnden (ARN):</strong> för konsumenttvister</li>
            <li><strong>Din bank:</strong> för återkallelse av betalningar</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Krediter förfaller inte</h2>
          <p>
            Köpta krediter förfaller inte och kan användas när som helst. De kan dock inte:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Överföras till ett annat konto</li>
            <li>Bytas mot kontanter</li>
            <li>Säljas eller handlas</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Hur du begär återbetalning</h2>
          <p>
            För att begära återbetalning:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Skicka e-post till support@spadom.se</li>
            <li>Ange ditt köp-ID eller transaktions-ID från Stripe</li>
            <li>Förklara anledningen till din återbetalningsbegäran</li>
            <li>Inkludera din e-postadress kopplad till kontot</li>
          </ol>
          <p>
            Vi svarar normalt inom 2-3 arbetsdagar och behandlar godkända återbetalningar inom 14 dagar.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">11. Kontakt</h2>
          <p>
            Vid frågor om vår återbetalningspolicy, kontakta oss på support@spadom.se
          </p>
        </section>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
        </p>
      </div>
    </div>
  );
}
