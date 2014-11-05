library scraper;

import 'package:html5lib/dom.dart';
import 'src/crawler.dart';

const ROOT = 'http://coursepress.lnu.se';

final DATE_PATTERN = new RegExp(r'(\d{4})\-(\d\d)\-(\d\d) (\d\d)\:(\d\d)');
final SYLLABUS_PATTERN = new RegExp(r'(kursinfo\.lnu\.se/(utbildning/)?GenerateDocument\.ashx)|kursplan.lnu.se');

class Course {
    String name;
    String code;
    String url;
    String syllabusUrl;
    String description;
    Post latestPost;
}

class Post {
    String heading;
    String author;
    DateTime time;
}

scrape() {
    crawl('$ROOT/kurser', _nextPages, 're222dv')
        .where((page) => page.url.startsWith('$ROOT/kurs/'))
        .listen((PageInfo<Document> page) {
            var course = new Course()
                ..name = page.data.querySelector('h1').text.trim()
                ..code = page.data.querySelector('#header-wrapper ul li:last-child').text.trim()
                ..url = page.url
                ..syllabusUrl = page.data.querySelectorAll('a[href]')
                    .map((a) => a.attributes['href'])
                    .firstWhere(
                        (href) => SYLLABUS_PATTERN.hasMatch(href),
                        orElse: () => null
                    )
                ..description = page.data.querySelector('.entry-content>p').text;

            print(course.name);
            print(course.code);
            print(course.url);
            print(course.syllabusUrl);
            print(course.description);

            var latestPost = page.data.querySelector('#latest-post').parent.nextElementSibling;
            if (latestPost != null) {
                var dateMatch = DATE_PATTERN.firstMatch(latestPost.querySelector('.entry-byline').text);
                course.latestPost = (
                    new Post()
                        ..heading = latestPost.querySelector('h1.entry-title').text
                        ..author = latestPost.querySelector('.entry-byline strong').text
                        ..time = (
                            new DateTime.utc(
                                int.parse(dateMatch.group(1)),
                                int.parse(dateMatch.group(2)),
                                int.parse(dateMatch.group(3)),
                                int.parse(dateMatch.group(4)),
                                int.parse(dateMatch.group(5))
                            )
                        )
                );
            }
        });
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
