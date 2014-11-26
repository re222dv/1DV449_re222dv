# Laboration 2
## Säkerhetsproblem
### PHP
PHP följer inte principen "secure by default", som den applikationen vi fick är byggd förvärrar det
dessutom problemet ytterligare genom flera entrypoints där man alltid måste kolla sessionen och
CSRF. Eftersom människor glömmer saker har applikationer som inte är byggda efter "secure by default"
mycket större risk för säkerhetshål.

Sails är "secure by default" därför att
1. CSRF skydd implementeras av ramverket så att alla request som inte går över GET kräver en CSRF token
1. En ORM gör att man själv inte skriver databasfrågor och därför inte råkar glömma parametisering.
1. Policies som jag har konfigurerat efter whitelising princip och kräver autorisering på alla rutter
  förutom de till UserController

Sidor som förklarar problemen med PHPs standardinställningar
1. <http://eev.ee/blog/2012/04/09/php-a-fractal-of-bad-design/#security>
1. <http://phpsecurity.readthedocs.org/en/latest/_articles/PHP-Security-Default-Vulnerabilities-Security-Omissions-And-Framing-Programmers.html>

### Session Cookie tillåts läsas av Javacript
Att låta Javascript på klienten läsa sessionskakan ökar dramatiskt risken för sessions-stöld vid
lyckad XSS. Sails tillåter inte att sessionskakan läses av Javascript på klienten.

### Ej parametiserade databasfrågor
Ej parametiserade databasfrågor gör att det går att göra SQL-injections vilket i det här fallet
leder till att man skulle kunna logga in utan användarnamn eller lösenord. Eftersom jag använder en
ORM så har jag inte det problemet, just nu anänder jga inte heller en SQL databas.

### Lösenord i klartext i databasen
Lösenorden sparas i klartext vilket gör att någon som lyckas stjäla databasen ser alla användares
lösenord. Detta är extra farligt då väldigt många har samma lösenord överallt. Jag har löst det
genom att använda Bcrypt.

### Databasen ligger i en av webbservern publicerad mapp
Databasen går lätt att ladda ner genom att besöka `/db.db`. Även om man skulle begränsa detta i
webbserverns konfiguration så glömmer männsiskor saker och kan råka publicera den i framtiden.
Sails databasfil ligger utanför den publicerade mappen vilket gör att det inte går att hämta den
utifrån.

### Lös typning leder till att användare alltid godkänns
Alla användarnamn och lösenord godkänns då `isUser` returnerar en sträng vid felaktigt användarnamn
eller lösenord, tack vare en löst typad if-sats så evalueras det som sant och alla användarnamn
och lösenord godkänns. Min `PasswordService` returnerar bara resultatet av `bcrypt.compareSync`
vilket antingen är `true` eller `false`.

### Ingen kontroll av att man är inloggad vid läsning eller skrivning
APIet för att posta och hämta meddelandet kollar inte att användaren är inloggad. Det gör att alla
kan skicka meddelanden även fast de inte är inloggade. Jag har löst det genom att ha `sessionAuth`
policyn aktiv på alla rutter förutom de till `UserController`.

### XSS
P.g.a. användning av `innerHtml` så är chatten helt öppen för diverse XSS attacker. Dessa skulle t.ex.
kunna stjäla sessionen, skapa en mask, skicka användaren till olika sidor och många liknande attacker.
Jag har löst det genom att istället använda `textContent` där inehållet inte tolkas av webbläsaren.

### CSRF
Meddelanden postas via GET och kräver inte ett CSRF token vilket gör chatten väldigt utsatt för CSRF
attacker som t.ex. postar meddelanden eller loggar ut användaren. Jag har löst det genom att
postning av meddelanden samt utloggning sköts över POST och aktiverat Sails CSRF skydd som kräver
ett CSRF token för alla request som använder ett annat verb än GET.

### Sqlite kräver skrivbehörighet till mappen databasen ligger i
Sqlite kräver skrivbehörighet till mappen som databasen ligger i istället för bara databasfilen.
Eftersom sqlite körs av PHP gör det att PHP också måste ha skrivbehörighet till den mappen, det gör
att ett säkerhetshål i PHP eller vår applikation kan leda till att externa användare kan skapa
körbara PHP-filer, och köra dom. Om externa användare kan exkvera PHP-kod på servern har de full
tillåtelse till allt som PHP har tillåtelse att göra, som att ansluta till databasen, skicka anrop
från vår server, läsa saker i /tmp, läsa alla användares sessioner, läsa applikationskod och om vår
server är felkonfigurerad komma åt systemfiler.
Detta löses genom att inte använda Sqlite. Med Sails är det dessutom bar en konfigurationsak att
använda en annan databashanterare vilket gör att det är lätt att byta till en extern och inte låta
Node ha skrivrättigheter till något alls.

### Meddelandet från databasexceptions skrivs i ett flertal fall ut till användaren
Databasexception kan innehålla känslig information som t.ex. databasstrukturen, användare och även
lösenord. Jag löser det genom att aldrig fånga undantag och istället låta Sails presentera en felsida
utan information vid undantag.

### debug.php går att komma åt av alla (och redirectas till efter att en post har lagts till), kommentaren säger att det är obra
Vad den skulle ha gjort kan jag inte veta, men jag har ingen sån fil.

### php_errors.log är åtkomlig utifrån
PHP fel kan innehålla information om applikationskoden och databasuppgifter. Jag har ingen sån logg
utan felmeddelanden skrivs till STDERR.

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
  mycket mindre Javascript att tolka och köra.
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
väldigt enkel. Denna lösningen har en stor fördel mot de jag sett i PHP då den inte pollar databasen
hela tiden utan bara ligger och väntar tills det händer nått. Den har dock en nackdel i att den inte
skalar horisontellt, om man har två instanser av Node så kommer bara de som lyssnar på samma instans
att få event.
