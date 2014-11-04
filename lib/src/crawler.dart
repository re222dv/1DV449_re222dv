library crawler;

import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:html5lib/parser.dart' show parse;
import 'package:html5lib/dom.dart';
import 'stream_functions.dart';

typedef String NextPage(PageInfo<Document> document);

class PageInfo<T> {
    String url;
    T data;

    PageInfo(this.url, this.data);
}

getPage(String userAgent) => (url) =>
    http.get(url, headers: {'User-Agent': userAgent})
        .then((response) => new PageInfo(url, response));

httpParser(StreamController seed) => (PageInfo response) {
    if (response.data.isRedirect) {
        seed.add(response.data.headers['Location']);
        return null;
    }
    if (response.data.statusCode != 200) throw 'Got status code ${response.data.statusCode}';

    return response..data = response.data.body;
};

PageInfo htmlParser(PageInfo page) => page..data = parse(page.data);

Stream<PageInfo<Document>> crawl(String url, NextPage nextPage, [String userAgent]) {
    var linksToGet = new StreamController<String>();
    var documents = linksToGet.stream
        .asyncMap(getPage(userAgent))
        .map(httpParser(linksToGet))
        .where(notNull)
        .map(htmlParser)
        .asBroadcastStream();

    documents
        .map(nextPage)
        .where(notNull)
        .listen(linksToGet.add);

    linksToGet.add(url);

    return documents;
}
