part of coursepress_scarper;

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
