library scraper;

import 'package:html5lib/dom.dart';
import 'src/crawler.dart';

const ROOT = 'http://coursepress.lnu.se';

scrape() {
    crawl('$ROOT/kurser', _nextPages, 're222dv').listen((p) => print('Got ${p.url}'));
}

Iterable<String> _nextPages(PageInfo<Document> document) {
    if (!document.url.startsWith('$ROOT/kurser')) return [];
    var nextPages = [];

    var nextLink = document.data.querySelector('a.next.page-numbers');
    if (nextLink != null) nextPages.add(ROOT + nextLink.attributes['href']);

    var courseLinks = document.data.querySelectorAll('.item-title a')
        .map((a) => a.attributes['href'])
        .where((link) => link.startsWith('$ROOT/kurs'));

    nextPages.addAll(courseLinks);

    return nextPages;
}
