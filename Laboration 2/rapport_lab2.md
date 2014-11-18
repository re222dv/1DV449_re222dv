## Hittade säkerhetshål
1. PHP
  2. <http://eev.ee/blog/2012/04/09/php-a-fractal-of-bad-design/#security>
  2. <http://phpsecurity.readthedocs.org/en/latest/_articles/PHP-Security-Default-Vulnerabilities-Security-Omissions-And-Framing-Programmers.html>
1. Session Cookie tillåts läsas av Javacript
1. Ej parametiserade databasfrågot
1. Lösenord i klartext i databasen
1. Databasen ligger i en av webbservern publicerad mapp
1. Lös typning leder till att användare alltid godkänns
1. Ingen kontroll av att man är inloggad vid läsning eller skrivning
1. XSS
1. CSRF
1. sqllite kräver skrivbehörighet till mappen databasem ligger i
1. Meddelandet från databasexceptions skrivs i ett flertal fall ut till användaren
1. debug.php går att gomma åt av alla (och redirectas till efter att en post har lagts till), kommentaren säger att det är obra
1. php_errors.log är åtkomlig utifrån
1. Sessionsstöld?
