part of coursepress_scarper;

const ROOT = 'https://coursepress.lnu.se';
const COURSE = '$ROOT/kurs/';
const PROJECT = '$ROOT/projekt/';
const PROGRAM = '$ROOT/program/';
const SUBJECT = '$ROOT/subject/';

final DATE_PATTERN = new RegExp(r'(\d{4})\-(\d\d)\-(\d\d) (\d\d)\:(\d\d)');
final SYLLABUS_PATTERN = new RegExp(r'(kursinfo\.lnu\.se/(utbildning/)?GenerateDocument\.ashx)|kursplan.lnu.se');

/// Scrapes CoursePress on Linnéaus University and returns a [Stream] of [Course]s
Stream<Page> scrape() {
    var namedPages = new StreamController.broadcast();

    var documents = crawl('$ROOT/kurser', nextPages, 're222dv')
            ..where((page) => page.url.startsWith(COURSE))
             .map(parseCourse)
             .listen(namedPages.add)

            ..where((page) => page.url.startsWith(PROJECT))
             .map(parsePage('project'))
             .listen(namedPages.add)

            ..where((page) => page.url.startsWith(PROGRAM))
             .map(parseProgram)
             .listen(namedPages.add)

            ..where((page) => page.url.startsWith(SUBJECT))
             .map(parsePage('subject'))
             .listen(namedPages.add)

            ..last
             .whenComplete(namedPages.close);

    return namedPages.stream;
}

/// Get the next page on course listing if exists and also all courses in the list itself
Iterable<String> nextPages(PageInfo<Document> document) {
    if (!document.url.startsWith('$ROOT/kurser')) return [];
    var nextPages = [];

    var nextLink = document.data.querySelector('a.next.page-numbers');
    if (nextLink != null) nextPages.add(ROOT + nextLink.attributes['href']);

    nextPages.addAll(
        document.data.querySelectorAll('.item-title a')
            .map((a) => a.attributes['href'])
            .where((link) =>
                link.startsWith(COURSE) ||
                link.startsWith(PROJECT) ||
                link.startsWith(PROGRAM) ||
                link.startsWith(SUBJECT)
            )
    );

    return nextPages;
}

/// Parses course data from a course page
Course parseCourse(PageInfo<Document> coursePage) =>
    new Course(
        name: coursePage.data.querySelector('h1').text.trim(),
        code: coursePage.data.querySelector('#header-wrapper ul li:last-child').text.trim(),
        url: coursePage.url,
        description: coursePage.data.querySelector('.entry-content>p').text,
        syllabusUrl: coursePage.data.querySelectorAll('a[href]')
            .map((a) => a.attributes['href'])
            .firstWhere(
                (href) => SYLLABUS_PATTERN.hasMatch(href),
                orElse: () => null
            ),
        latestPost: parseLatestPost(coursePage.data)
    );

/// Parses a generic page
parsePage(String type) => (PageInfo<Document> page) =>
    new Page(
        type: type,
        name: page.data.querySelector('h1').text.trim(),
        url: page.url,
        latestPost: parseLatestPost(page.data)
    );

/// Parses a program page
Program parseProgram(PageInfo<Document> programPage) =>
    new Program(
        name: programPage.data.querySelector('h1').text.trim(),
        url: programPage.url,
        description: programPage.data.querySelector('.entry-content>p').text,
        latestPost: parseLatestPost(programPage.data)
    );

/// Parses the latest post on a course page
Post parseLatestPost(Document coursePage) {
    var latestPost = coursePage.querySelector('#latest-post').parent.nextElementSibling;
    if (latestPost == null) return null;

    return new Post(
        heading: latestPost.querySelector('h1.entry-title').text,
        author: latestPost.querySelector('.entry-byline strong').text,
        time: parseDate(latestPost.querySelector('.entry-byline').text)
    );
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
