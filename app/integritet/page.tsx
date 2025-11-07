// app/integritet/page.tsx
export default function IntegritetPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Integritetspolicy
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Inledning</h2>
          <p>
            Denna integritetspolicy beskriver hur Spådom.se ("vi", "oss", "vår") samlar in, använder 
            och skyddar dina personuppgifter när du använder vår tjänst.
          </p>
          <p>
            Vi tar din integritet på allvar och är engagerade i att skydda dina personuppgifter i 
            enlighet med GDPR (Dataskyddsförordningen) och annan tillämplig lagstiftning.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Personuppgiftsansvarig</h2>
          <p>
            Personuppgiftsansvarig för behandlingen av dina personuppgifter är:
          </p>
          <p>
            [Företagsnamn]<br />
            [Adress]<br />
            [Organisationsnummer]<br />
            E-post: support@spadom.se
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Vilka uppgifter samlar vi in?</h2>
          <p>
            Vi samlar in följande typer av personuppgifter:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Kontaktuppgifter:</strong> E-postadress</li>
            <li><strong>Betalningsinformation:</strong> Betalningshistorik (kortuppgifter lagras hos Stripe, inte hos oss)</li>
            <li><strong>Användningsdata:</strong> IP-adress, webbläsartyp, besökta sidor, tidsstämplar</li>
            <li><strong>Innehåll:</strong> Dina frågor och eventuellt födelsedatum som du frivilligt anger</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Hur använder vi dina uppgifter?</h2>
          <p>
            Vi använder dina personuppgifter för att:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tillhandahålla och förbättra vår tjänst</li>
            <li>Hantera ditt konto och inloggning</li>
            <li>Behandla betalningar och köp</li>
            <li>Generera och leverera spådomar</li>
            <li>Kommunicera med dig om din användning av tjänsten</li>
            <li>Förhindra bedrägeri och säkerställa säkerhet</li>
            <li>Följa lagkrav</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Rättslig grund för behandling</h2>
          <p>
            Vi behandlar dina personuppgifter baserat på:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Fullgörande av avtal:</strong> För att tillhandahålla tjänsten du har köpt</li>
            <li><strong>Berättigat intresse:</strong> För att förbättra vår tjänst och säkerhet</li>
            <li><strong>Samtycke:</strong> För cookies och marknadsföring (där tillämpligt)</li>
            <li><strong>Rättslig förpliktelse:</strong> För att följa lagkrav</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Delning av uppgifter</h2>
          <p>
            Vi delar dina personuppgifter med:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Stripe:</strong> För betalningshantering</li>
            <li><strong>Firebase (Google):</strong> För autentisering och datalagring</li>
            <li><strong>AI-tjänster:</strong> För att generera spådomar (anonymiserat där möjligt)</li>
          </ul>
          <p>
            Vi säljer aldrig dina personuppgifter till tredje part.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Datalagring</h2>
          <p>
            Vi lagrar dina personuppgifter så länge du har ett aktivt konto hos oss. Efter att du 
            raderat ditt konto raderas dina uppgifter inom 30 dagar, förutom vad som krävs för att 
            uppfylla lagkrav (t.ex. bokföring).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Dina rättigheter</h2>
          <p>
            Enligt GDPR har du rätt att:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Få tillgång till dina personuppgifter</li>
            <li>Rätta felaktiga uppgifter</li>
            <li>Radera dina uppgifter ("rätten att bli glömd")</li>
            <li>Begränsa behandling av dina uppgifter</li>
            <li>Invända mot behandling</li>
            <li>Dataportabilitet</li>
            <li>Återkalla samtycke när som helst</li>
            <li>Lämna klagomål till Integritetsskyddsmyndigheten</li>
          </ul>
          <p>
            För att utöva dina rättigheter, kontakta oss på support@spadom.se
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Säkerhet</h2>
          <p>
            Vi vidtar lämpliga tekniska och organisatoriska åtgärder för att skydda dina 
            personuppgifter mot obehörig åtkomst, förlust, missbruk eller ändring. Detta inkluderar 
            kryptering, säker datalagring och åtkomstkontroller.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Cookies</h2>
          <p>
            Vi använder cookies för att förbättra din upplevelse. Se vår{' '}
            <a href="/cookies" className="text-mystical-purple hover:underline">
              cookiepolicy
            </a>{' '}
            för mer information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Ändringar av policyn</h2>
          <p>
            Vi kan uppdatera denna integritetspolicy från tid till annan. Väsentliga ändringar kommer 
            att meddelas via e-post eller på webbplatsen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Kontakt</h2>
          <p>
            Vid frågor om denna integritetspolicy eller hur vi behandlar dina personuppgifter, 
            kontakta oss på support@spadom.se
          </p>
        </section>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
        </p>
      </div>
    </div>
  );
}
