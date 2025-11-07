// app/cookies/page.tsx
export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Cookiepolicy
      </h1>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Vad är cookies?</h2>
          <p>
            Cookies är små textfiler som lagras på din enhet (dator, mobil, surfplatta) när du 
            besöker en webbplats. Cookies gör det möjligt för webbplatsen att komma ihåg dina 
            preferenser och förbättra din användarupplevelse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Hur använder vi cookies?</h2>
          <p>
            På Spådom.se använder vi cookies för att:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hålla dig inloggad mellan besök</li>
            <li>Komma ihåg dina preferenser</li>
            <li>Säkerställa säkerheten för vår tjänst</li>
            <li>Analysera hur webbplatsen används (om du samtycker till analyscookies)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Typer av cookies</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">3.1 Nödvändiga cookies</h3>
          <p>
            Dessa cookies är nödvändiga för att webbplatsen ska fungera. De kan inte stängas av och 
            inkluderar:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Autentiseringscookies:</strong> Håller dig inloggad (Firebase Auth)</li>
            <li><strong>Säkerhetscookies:</strong> Skyddar mot bedrägeri och obehörig åtkomst</li>
            <li><strong>Sessionscookies:</strong> Lagrar temporär information under ditt besök</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">3.2 Funktionella cookies</h3>
          <p>
            Dessa cookies gör det möjligt för webbplatsen att komma ihåg val du gör:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Språkpreferenser</li>
            <li>Temaval (ljust/mörkt läge)</li>
            <li>Cookiesamtycke</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">3.3 Analyscookies (kräver samtycke)</h3>
          <p>
            Om du samtycker kan vi använda analyscookies för att:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Förstå hur besökare använder webbplatsen</li>
            <li>Se vilka sidor som är mest populära</li>
            <li>Förbättra användarupplevelsen</li>
          </ul>
          <p>
            Vi kan använda Google Analytics eller liknande tjänster för detta ändamål.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Tredjepartscookies</h2>
          <p>
            Vi använder följande tredjepartstjänster som kan sätta cookies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Firebase (Google):</strong> För autentisering och datalagring</li>
            <li><strong>Stripe:</strong> För betalningshantering</li>
            <li><strong>Google Analytics:</strong> För analys (om du samtycker)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Hantera cookies</h2>
          <p>
            Du kan när som helst ändra dina cookieinställningar genom att:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Använda cookiebannern på webbplatsen</li>
            <li>Ändra inställningarna i din webbläsare</li>
            <li>Radera cookies i din webbläsare</li>
          </ul>
          <p>
            Observera att om du blockerar nödvändiga cookies kan webbplatsen inte fungera korrekt.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-4">Hantera cookies i olika webbläsare:</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Chrome:</strong> Inställningar → Sekretess och säkerhet → Cookies</li>
            <li><strong>Firefox:</strong> Inställningar → Sekretess och säkerhet → Cookies</li>
            <li><strong>Safari:</strong> Inställningar → Sekretess → Cookies</li>
            <li><strong>Edge:</strong> Inställningar → Cookies och webbplatsbehörigheter</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Livslängd för cookies</h2>
          <p>
            Våra cookies har olika livslängder:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Sessionscookies:</strong> Raderas när du stänger webbläsaren</li>
            <li><strong>Beständiga cookies:</strong> Finns kvar i upp till 12 månader</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Uppdateringar av cookiepolicyn</h2>
          <p>
            Vi kan uppdatera denna cookiepolicy från tid till annan för att återspegla ändringar i 
            vår användning av cookies eller av rättsliga skäl.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Kontakt</h2>
          <p>
            Vid frågor om vår användning av cookies, kontakta oss på support@spadom.se
          </p>
        </section>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
        </p>
      </div>
    </div>
  );
}
