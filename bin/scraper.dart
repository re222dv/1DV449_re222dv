import 'dart:io';
import 'package:RestLibrary/restlibrary.dart';
import 'package:Scraper/coursepress_scraper.dart';

const FILENAME = 'scrapedata.json';

class SimpleResponse extends Response {
    SimpleResponse(data) : super(data);
    toString() => data;
}

main() {
    var restServer = new RestServer()
        ..route(new Route('/')
            ..get = onRequest);

    new HttpTransport(restServer, address: InternetAddress.ANY_IP_V4, port: 7070);
}

onRequest(Request request) =>
    isCacheOld(FILENAME)
        .then((old) => old ? cacheToFile(FILENAME, scrape()) : readFromFile(FILENAME))
        .then((content) => new SimpleResponse(content));
