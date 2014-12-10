# Rapport Labb 3


## Vad finns det för krav du måste anpassa dig efter i de olika API:erna?
Om man genererar mer än 25000 sidladdningar per dag under 90 dagar så kommer Google att
försöka kontakta en för att diskutera betalning.
SR säger att man inte ska använda deras API för att skada dem och vill att man ska vara
snäll mot APIet.

## Hur och hur länga cachar du ditt data för att slippa anropa API:erna i onödan?
Google sköter sitt kart API själva dels genom sitt Javascript API som sen wrappas ytterligare
med <google-map> komponenten som jag använder.
SRs trafikmeddelanden cachar jag i fem minuter på servern och områden cachar jag i 6 månader.
Sen när jag anropar SR igen så skickar jag med en `If-Modified-Since` som SR just dock ignorerar
och alltid svarar med ett helt svar. 

## Vad finns det för risker med din applikation?
Om Google eller SR går ner eller slutar fungera så slutar min applikation att fungera.

## Hur har du tänkt kring säkerheten i din applikation?
Eftersom SR inte ger en position för områdena gör jag en sökning med Google Map för att få ut
kordinater. Denna sökningen görs på klientsidan och skickas sedan till servern då jag inte hittade
ett kart API som gick att använda på serversidan. Den valideringen som görs är att kordinaterna är
siffror men inget annat, det gör att fel position kan skickas av en ond klient. Problemet är dock
uppskutet med 6 månader då servern inte tillåter skrivning till områden som redan har en position
och eftersom de som finna cacheas i 6 månader finns det god tid till att lösa probelmet.

Då jag använder Polymers databinding som under huven använder textContent kan ingen html slinka
in från SRs api. Google map apiet kör dock javascript på min sida vilket gör att Google har full
möjlighet till en XSS attack.

## Hur har du tänkt kring optimeringen i din applikation?
Alla element vulcanizeras till en fil med all css, html och javascript för att minimera antalet
request som krävs, denna minifieras sedan för att bli så liten som möjligt. Alla statiska resurser
har Cacheheaders som tillåter en månads cache förutom index.html som kan caches i en timme. Detta
för att jag använder cache-bursting teknik för att kunna uppdatera siten trots lång cahce-tid.
Alla resurser som inte redan är komprimerade gzippas on-the-fly av nginx. 
Polyfills för web components laddas endast in av webbläsare som behöver de (i dagsläget alla utom
Chrome och Opera) m.h.a. feature detection. 
