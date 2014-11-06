part of coursepress_scarper;

class Course {
    final String name;
    final String code;
    final String url;
    final String syllabusUrl;
    final String description;
    final Post latestPost;

    Course({
        this.name: null,
        this.code: null,
        this.url: null,
        this.syllabusUrl: null,
        this.description: null,
        this.latestPost: null
    });
}

class Post {
    final String heading;
    final String author;
    final DateTime time;

    Post({
        this.heading : null,
        this.author : null,
        this.time : null
    });
}
