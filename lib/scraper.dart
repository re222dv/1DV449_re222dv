library scraper;

import 'dart:async';
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

/**
 * Scrapes CoursePress on Linnéaus University and returns a [Stream] of [Course]s
 */
Stream<Course> scrape() =>
    crawl('$ROOT/kurser', nextPages, 're222dv')
        .where((page) => page.url.startsWith('$ROOT/kurs/'))
        .map((PageInfo<Document> coursePage) {
            var document = coursePage.data;
            var course = new Course()
                ..name = document.querySelector('h1').text.trim()
                ..code = document.querySelector('#header-wrapper ul li:last-child').text.trim()
                ..url = coursePage.url
                ..description = document.querySelector('.entry-content>p').text
                ..syllabusUrl = document.querySelectorAll('a[href]')
                    .map((a) => a.attributes['href'])
                    .firstWhere(
                        (href) => SYLLABUS_PATTERN.hasMatch(href),
                        orElse: () => null
                    );

            var latestPost = document.querySelector('#latest-post').parent.nextElementSibling;
            if (latestPost != null) {
                course.latestPost = new Post()
                    ..heading = latestPost.querySelector('h1.entry-title').text
                    ..author = latestPost.querySelector('.entry-byline strong').text
                    ..time = parseDate(latestPost.querySelector('.entry-byline').text);
            }

            return course;
        });

/// Get the next page on course listing if exists and also all courses in the list itself
Iterable<String> nextPages(PageInfo<Document> document) {
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

/// Returns the first found [DateTime] in [text]
DateTime parseDate(String text) {
    var dateMatch = DATE_PATTERN.firstMatch(text);

    return new DateTime.utc(
        int.parse(dateMatch.group(1)),
        int.parse(dateMatch.group(2)),
        int.parse(dateMatch.group(3)),
        int.parse(dateMatch.group(4)),
        int.parse(dateMatch.group(5))
    );
}
