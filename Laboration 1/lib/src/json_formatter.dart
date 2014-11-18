part of coursepress_scarper;

const JSON_FORMATTERS = const {
    Course: courseFormatter,
    Post: postFormatter,
    Page: pageFormatter,
    Program: programFormatter,
};

toJson(object) => JSON_FORMATTERS[object.runtimeType](object);

Map courseFormatter(Course course) => pageFormatter(course)..addAll({
    'code': course.code,
    'syllabusUrl': course.syllabusUrl,
    'description': course.description,
});

Map pageFormatter(Page page) => {
    'name': page.name,
    'url': page.url,
    'latestPost': page.latestPost == null ? null : postFormatter(page.latestPost),
};


Map postFormatter(Post post) => {
    'heading': post.heading,
    'author': post.author,
    'time': post.time.toIso8601String(),
};

Map programFormatter(Program program) => pageFormatter(program)..addAll({
    'description': program.description,
});
