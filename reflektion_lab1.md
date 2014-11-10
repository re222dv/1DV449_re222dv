# Vad tror Du vi har för skäl till att spara det skrapade datat i JSON-format?
JSON är ett enkelt format att arbeta med och föredras av många vid REST APIer.
Det används dessutom av många noSQL databaser som t.ex. mongodb eller neo4j.

# Olika jämförelsesiter är flitiga användare av webbskrapor. Kan du komma på fler typer av tillämplingar där webbskrapor förekommer?
Sökmotorer skrapar skidor på många olika sätt, ett intressant exempel är Google som parse:ar
strukturerad data och sparar den i sin "knowledge graph".

# Hur har du i din skrapning underlättat för serverägaren?
Det beror på. Får serverägaren en fördel av det, som t.ex. att en app basarad på den skrapade datan
gör hens sida mer populär. Andra fall kan va att hen slipper skapa ett API eller ge iväg datan manuellt.

# Vilka etiska aspekter bör man fundera kring vid webbskrapning?
Att följa `robots.txt` och inte skrapa ej tillåtna sidor samt följa `Crawl-delay`
Att skicka en User Agent som är unik så att siteägaren kan identifiera botten.
Att även om en `Crawl-delay` inte är specificerad inte fråga för snabbt

# Vad finns det för risker med applikationer som innefattar automatisk skrapning av webbsidor? Nämn minst ett par stycken!
En stor risk är att HTMLen kan ändras, siteägaren kanske inte vet om att någon skrapar och är
beroende av strukteren eller tycker att det är mindre viktigt än att presentera en bra sida för
användarna som besöker den.

En annan risk är att vi hämtar data som vi inte har rätt till genom exempelvis copyright. Det kan
hända att siteägaren blir arg och stänger oss ute helt.

# Tänk dig att du skulle skrapa en sida gjord i ASP.NET WebForms. Vad för extra problem skulle man kunna få då?
Ostrukturerad HTML vilket gör att det blir svårare att hämta korrekt data. Komponenter kan
rendera olika HTML vid olika tillfällen vilker gör det väldigt svårt att hitta rätt i alla fall.

# Välj ut två punkter kring din kod du tycker är värd att diskutera vid redovisningen. Det kan röra val du gjort, tekniska lösningar eller lösningar du inte är riktigt nöjd med.
Jag har valt att programmera med mönstret FRP (Functional Reactive Programming) då jag länge velat
testa det och kände att en webbskrapa måste vara ett ultimat användningsområde för det. Eftersom
det har bestämmt hur jag har designat hela min applikation leder det in på både positiva och negativa
saker.

Jag vill även diskutera svårigheten med att veta när skrapan är klar då det har varit ett stort
problem som jag tidigare löste med ett fulhack men till slut fick till en lösning som jag tror är
ganska bra.

# Hitta ett rättsfall som handlar om webbskrapning. Redogör kort för detta.
Jag tycker detta är väldigt intressant <http://petewarden.com/2010/04/05/how-i-got-sued-by-facebook/>
vilket, om jag förstod det rätt, faktiskt inte gick till domstol men som troligtvis gjort om det
handlat om någon annan.
Det är intressant för att Facebook vid den tiden hade en väldigt tillåtande `robots.txt` vilket
är de-facoto standarden för att berätta om det är tillåtet att crawla sidan eller inte.
Han hade även tidigare skrapat sidor som Twitter och Google utan problem, men undkom med en hårsmån
en stämning för att han varit i kontakt med Facebooks säkerhetsteam tidigare för att rapportera
säkerhetshål.

# Känner du att du lärt dig något av denna uppgift?
Jag känner att jag lärt mig lite mer om funktionell programmering som koncept samt Dart sam språk
men framförallt har jag lärt mig mycket om FRP.
