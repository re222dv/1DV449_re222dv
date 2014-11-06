part of coursepress_scarper;

/// Reads and return the cached course data
Future<String> readFromFile(String filename) =>
    new File(filename)
        .readAsString();

/// Collects the stream of courses, caches and returns them
Future<String> cacheToFile(String filename, Stream<Course> courses) =>
    courses
        .map(toJson)
        .map(noInformation)
        .toList()
        .then((list) {
            list.sort((a, b) => a['name'].compareTo(b['name']));
            return list;
        })
        .then(createWrapper)
        .then(JSON.encode)
        .then((json) =>
            new File(filename)
                .writeAsString(json, flush: true)
                .then((_) => json)
        );

/// Checks if the cached course data is old
Future<bool> isCacheOld(String filename) =>
    readFromFile(filename)
        .then(JSON.decode)
        .then((json) => json['timestamp'])
        .then(DateTime.parse)
        .then((timestamp) => timestamp.add(new Duration(minutes: 5)))
        .then((timestamp) => timestamp.isBefore(new DateTime.now()))
        .catchError((_) => true);

/// Creates an json encodable format of a [Course]
Map toJson(Course course) => {
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

/// Changes null values to a no information label
Map noInformation(Map input) => input..keys.forEach((key) {
    var value = input[key];
    if (value == null) {
        input[key] = 'no information';
    }
});

/// Wraps the courses in a body with a date and a count
Map createWrapper(List courses) => {
    'courses': courses,
    'coursesCount': courses.length,
    'timestamp': new DateTime.now().toIso8601String(),
};
