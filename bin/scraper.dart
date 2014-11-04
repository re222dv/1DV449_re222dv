import 'package:Scraper/scraper.dart';

void main() {
  documents.listen((_) => print('Got Stuff!'));
  linksToGet.add('http://coursepress.lnu.se/kurser');
}
