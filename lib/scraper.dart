library scraper;

import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:html5lib/parser.dart' show parse;
import 'package:html5lib/dom.dart';

var linksToGet = new StreamController<String>();
var documents = linksToGet.stream
    .asyncMap(getPage)
    .map(httpParser)
    .where(notNull)
    .map(parse);

Future<http.Response> getPage(String url) =>
    http.get(url, headers: {'User-Agent': 're222dv'});

String httpParser(http.Response response) {
    if (response.isRedirect) {
        linksToGet.add(response.headers['Location']);
        return null;
    }
    if (response.statusCode != 200) throw 'Got status code ${response.statusCode}';

    return response.body;
}

bool notNull(a) => a != null;
