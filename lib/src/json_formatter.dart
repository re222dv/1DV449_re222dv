part of coursepress_scarper;

const JSON_FORMATTERS = const {
    Course: courseFormatter,
    Post: postFormatter,
    Project: projectFormatter,
    Program: programFormatter,
    Subject: subjectFormatter,
};

toJson(object) => JSON_FORMATTERS[object.runtimeType](object);

Map courseFormatter(Course course) => {
    'name': course.name,
    'code': course.code,
    'url': course.url,
    'syllabusUrl': course.syllabusUrl,
    'description': course.description,
    'latestPost': course.latestPost == null ? null : postFormatter(course.latestPost),
};

Map postFormatter(Post post) => {
    'heading': post.heading,
    'author': post.author,
    'time': post.time.toIso8601String(),
};

Map projectFormatter(Project project) => {
    'name': project.name,
    'url': project.url,
    'latestPost': project.latestPost == null ? null : postFormatter(project.latestPost),
};

Map programFormatter(Program program) => {
    'name': program.name,
    'url': program.url,
    'description': program.description,
    'latestPost': program.latestPost == null ? null : postFormatter(program.latestPost),
};

Map subjectFormatter(Subject subject) => {
    'name': subject.name,
    'url': subject.url,
    'latestPost': subject.latestPost == null ? null : postFormatter(subject.latestPost),
};

