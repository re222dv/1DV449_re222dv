library crawler;

import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:html5lib/parser.dart' as html show parse;
import 'package:html5lib/dom.dart';
import 'stream_functions.dart';

const STOP_CRAWLING = 'stop crawling';
final _pagesToVisit = [];

/// A function that returns an [Iterable] with links that should be visited next
typedef Iterable<String> NextPages(PageInfo<Document> document);
/// A function that downloads a page
typedef Future<PageInfo<http.Response>> PageGetter(String url);
/// A function that parses http and returns the body or null
typedef PageInfo<String> HttpParser(PageInfo<http.Response> response);

class PageInfo<T> {
    final String url;
    final T data;

    PageInfo(this.url, this.data);
}

/**
 * Crawls pages starting at [url] and continues to pages returned by [nextPages]
 * Returns a [Stream] of [PageInfo] with the url and DOM object for each page visited
 */
Stream<PageInfo<Document>> crawl(String url, NextPages nextPages, [String userAgent]) {
    var linksToGet = new StreamController<String>();
    var documents = linksToGet.stream
        .asyncMap(getPage(userAgent))
        .map(httpParser(linksToGet.add))
        .where(notNull)
        .map(htmlParser)
        .asBroadcastStream();

    documents
        .map(_get(nextPages))
        .handleError((_) => linksToGet.close(), test: (error) => error == STOP_CRAWLING)
        .map((nextPages) => new Stream.fromIterable(nextPages))
        .transform(flatten)
        .listen(linksToGet.add);

    linksToGet.add(url);

    return documents;
}

/// Returns a [PageGetter] that get pages with [userAgent]
PageGetter getPage([String userAgent]) => (url) =>
    http.get(url, headers: {'User-Agent': userAgent})
        .then((response) => new PageInfo(url, response));

/// Returns a [HttpParser] that adds redirects to [linksToGet]
HttpParser httpParser(addLinkToGet(String link)) => (PageInfo<http.Response> response) {
    if (response.data.isRedirect) {
        addLinkToGet(response.data.headers['Location']);
        return null;
    }
    if (response.data.statusCode != 200) throw 'Got status code ${response.data.statusCode}';

    return new PageInfo(response.url, response.data.body);
};

/// Parses html and returns a DOM object
PageInfo<Document> htmlParser(PageInfo<String> page) => new PageInfo(page.url, html.parse(page.data));

/// Keeps track of all pages that we should visit so that we know when we are done
NextPages _get(NextPages nextPages) => (PageInfo<Document> document) {
    Iterable links = nextPages(document);

    _pagesToVisit.remove(document.url);
    _pagesToVisit.addAll(links);

    if (_pagesToVisit.isEmpty) throw STOP_CRAWLING;

    return links;
};
