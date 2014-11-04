library scraper;

import 'package:html5lib/dom.dart';
import 'src/crawler.dart';

const ROOT = 'http://coursepress.lnu.se';

scrape() {
    crawl('$ROOT/kurser', _nextPage, 're222dv').listen((_) => print('Got Stuff!'));
}

String _nextPage(PageInfo<Document> document) {
    if (!document.url.startsWith('$ROOT/kurser')) return null;

    var link = document.data.querySelector('a.next.page-numbers');
    if (link == null) return null;

    return ROOT + link.attributes['href'];
}
