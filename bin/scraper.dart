import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:Scraper/scraper.dart';

main() {
    const FILENAME = 'scrapedata.json';

    isOld(FILENAME)
        .then((old) {
            if (old) {
                print('The data is old, scraping started');

                var courses = [];

                scrape()
                    .map(asJson)
                    .map(noInformation)
                    .listen(courses.add)
                    .asFuture()
                    .then(createWrapper(courses))
                    .then(JSON.encode)
                    .then(saveToFile(FILENAME))
                    .then((_) => print('Data have been written'));
            } else {
                print('The data is fresh');
            }
        });
}

Future<bool> isOld(String filename) =>
    new File(filename)
        .readAsString()
        .then(JSON.decode)
        .then((json) => json['timestamp'])
        .then(DateTime.parse)
        .then((timestamp) => timestamp.add(new Duration(minutes: 5)))
        .then((timestamp) => timestamp.isBefore(new DateTime.now()))
        .catchError((_) => true);

Map asJson(Course course) => {
    'name': course.name,
    'code': course.code,
    'url': course.url,
    'syllabusUrl': course.syllabusUrl,
    'description': course.description,
    'latestPost': course.latestPost == null ? null : {
        'heading': course.latestPost.heading,
        'author': course.latestPost.author,
        'time': course.latestPost.time.toIso8601String()
    },
};

Map noInformation(Map input) => input..keys.forEach((key) {
    var value = input[key];
    if (value == null) {
        input[key] = 'no information';
    }
});

Function createWrapper(List courses) => (_) => {
    'courses': courses,
    'coursesCount': courses.length,
    'timestamp': new DateTime.now().toIso8601String(),
};

Function saveToFile(String filename) => (json) =>
    new File(filename)
      .writeAsString(json, flush: true);
