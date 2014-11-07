part of coursepress_scarper;

abstract class NamedPage {
    final String name;
    final String url;

    NamedPage(this.name, this.url);
}

class Course extends NamedPage {
    final String code;
    final String syllabusUrl;
    final String description;
    final Post latestPost;

    Course({
        name,
        this.code,
        url,
        this.syllabusUrl,
        this.description,
        this.latestPost
    }) : super(name, url);
}

class Post {
    final String heading;
    final String author;
    final DateTime time;

    Post({
         this.heading,
         this.author,
         this.time
    });
}

class Project extends NamedPage {
    final Post latestPost;

    Project({
        name,
        url,
        this.latestPost
    }) : super(name, url);
}

class Program extends NamedPage {
    final String description;
    final Post latestPost;

    Program({
        name,
        url,
        this.description,
        this.latestPost
    }) : super(name, url);
}

class Subject extends NamedPage {
    final Post latestPost;

    Subject({
        name,
        url,
        this.latestPost
    }) : super(name, url);
}
