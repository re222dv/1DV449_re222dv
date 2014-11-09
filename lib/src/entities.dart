part of coursepress_scarper;

class Course extends Page {
    final String code;
    final String syllabusUrl;
    final String description;

    Course({
        name,
        this.code,
        url,
        this.syllabusUrl,
        this.description,
        latestPost
    }) : super(
        type: 'course',
        name: name,
        url: url,
        latestPost: latestPost
    );
}

class Page {
    final String type;
    final String name;
    final String url;
    final Post latestPost;

    Page({
        this.type,
        this.name,
        this.url,
        this.latestPost
    });
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

class Program extends Page {
    final String description;

    Program({
        name,
        url,
        this.description,
        latestPost
    }) : super(
        type: 'program',
        name: name,
        url: url,
        latestPost: latestPost
    );
}
