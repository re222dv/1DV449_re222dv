## Hittade säkerhetshål
1. PHP
  2. <http://eev.ee/blog/2012/04/09/php-a-fractal-of-bad-design/#security>
  2. <http://phpsecurity.readthedocs.org/en/latest/_articles/PHP-Security-Default-Vulnerabilities-Security-Omissions-And-Framing-Programmers.html>
1. Session Cookie tillåts läsas av Javacript
1. Ej parametiserade databasfrågor
1. Lösenord i klartext i databasen
1. Databasen ligger i en av webbservern publicerad mapp
1. Lös typning leder till att användare alltid godkänns
1. Ingen kontroll av att man är inloggad vid läsning eller skrivning
1. XSS
1. CSRF
1. sqllite kräver skrivbehörighet till mappen databasen ligger i
1. Meddelandet från databasexceptions skrivs i ett flertal fall ut till användaren
1. debug.php går att komma åt av alla (och redirectas till efter att en post har lagts till), kommentaren säger att det är obra
1. php_errors.log är åtkomlig utifrån
1. Sessionsstöld?

## Optimering
Alla mätningar är gjorda i Firefox och avlästa i nätverksfliken i dev-tools efter en cache-fri omladdning.
Tider är uppskattad medel efter 5 cache-fria omladdningar.

PHP applikationen körs på en ganska snabb konfiguration då statiska filer servas av nginx och PHP
filer skickas av nginx till php-fpm över en unix-socket som har en preforkad tråd redo.
Node applikationen servas dock direkt av node och sails vilket bör ge snabbare responstid av
dynamiska resurser men kraftigt långsammare responstid på statiska.

PHP applikationen skickar 14 request på `1043 kB` och tar runt `0,60 s` att ladda. Två av dessa är
till longpoll.js som inte är implementerad än.
Node applikationen med HTML, CSS och Javascript från PHP applikationen (förutom fix för XSS) skickar
12 request (den försöker inte ladda longpoll.js eftersom Sails automatiskt länkar in de js-filer
som finns) på `869,27 kB` och tar runt `0,43 s` att ladda. Att den är mindre är för att Sails
länkar in varje js fil och bara en gång (PHP versionen länkar in jquery två gånger men aldrig den
minifierade jquery). 

### Optimeringar
1. Borttagning av minifierade jquery sparar `91 kB` men ingen tid då jag testar lokalt.
1. Borttagning av `b.jpg` som inte används sparar `189 kB`.
1. Borttagning av `script.js` som är samma som `bootstrap.js` förutom för [en massa tomrader i början](script.js.diff)
  sparar `66 kB`.
1. En build av bootstrap med bara de komponenter som används sparar `304 kB` och ett request då
  javascriptet inte behövs, detta tar också bort bootstraps beroende på jQuery.
1. Att göra en egen ajaxfunktion och kasta jQuery sparar ytterligare `266 kB` och för första gången
  ser vi en förbättrad laddningstid till runt `0,32 s`. Mest är det för att webbläsaren får
  mycket mindre JavaScript att tolka och köra.
1. Nu är storleken alltså nere på `97 kB` med 8 request. Att köra sails i produktionsläge
  (minifiering och konkatenering av CSS och JS) tar ner det till 6 request och `89 kB`.
1. Minifiering av HTML sparar ytterligare `3 kB`
1. Att flytta ut CSS till en separat fil som sen minfieras och konkateneras ger `0,1 kB` och
  tillåter caching.

### Teoretiska Optimeringar
Optimeringar som bör snabba upp applikationen ytterligare men som jag inte kommer göra p.g.a.
tiden att göra dom är (för mig som inte har tillräckliga kunskaper om detta) väldigt hög.

Responstiden av Nodeapplikationen skulle kunna ökas genom att låta nginx serva de statiska resurserna.
Alla statiska resurser i PHP applikationen har `0 ms` laddningstid enligt Firefox som man kan jämföra
med Node applikationen där de fyra statiska resurserna servas på i snitt `4 ms` var.
Nginx hanterar även e-tags för cachening och gzip automatiskt.

Båda de bilderna som finns består av text och enkla former och skulle därför göra sig mycket bra som
SVG vilket skulle minska storleken samtidigt som de skulle skalas bra på högupplösta skärmar.
Bilderna skulle dessutom kunna bakas ihop till en för att få bort ett av requesten.

Tiden mellan att den sista statiska resursen laddas och meddelandena laddas är `~100 ms` vilket
tyder på att webbläsaren spenderar en hel del tid på att tolka och rendera sidan. Mycket av den tiden
bör bero på bootstrap som fortfarande stoppar in väldigt många regler med mycket dåliga (ej optimerade)
selektorer (baserat på kapitel 14 "Simplifying CSS Selectors" i boken "Even Faster Web Sites").

Om man inte slår ihop bilderna skulle en förbättring vara att förladda `clock.png` vilket skulle
kunna klippa `60 ms` då den kan laddas parallellt.

Om chattenhistoriken skulle bli lång kan paginering minska storleken samt förbättra avändarupplevelsen.

## Longpolling
Jag har implementerat longpolling genom att skapa en EventService för att skicka event mellan
requesten. Den håller ett objekt med alla subscribers som loopas över när ett nytt event ska skickas.
Alla subscribers får ett slumpmässigt id som används för att unsubscribe:a och göra minnet
tillgängligt för GCn att rensa upp. Eftersom Node är enkeltrådat och non-blocking är denna modell
väldigt enkel. Den har dock en nackdel i att den inte skalar horisontellt, om man har två instanser
av Node så kommer bara de som lyssnar på samma instans att få event.
