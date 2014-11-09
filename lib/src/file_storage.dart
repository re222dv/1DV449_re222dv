part of coursepress_scarper;

/// Reads and return the cached course data
Future<String> readFromFile(String filename) =>
    new File(filename)
        .readAsString();

/// Collects the stream of courses, caches and returns them
Future<String> cacheToFile(String filename, Stream<Page> namedPages) =>
    Future.wait([
        namedPages.where((page) => page is Course).toList(),
        namedPages.where((page) => page.type == 'project').toList(),
        namedPages.where((page) => page is Program).toList(),
        namedPages.where((page) => page.type == 'subject').toList(),
    ])
    .then((pageTypes) =>
        pageTypes
            .map((pages) =>
                pages
                    .map(toJson)
                    .map(noInformation)
                    .toList()
            )
            .map((pages) {
                pages.sort((a, b) => a['name'].compareTo(b['name']));
                return pages;
            })
            .toList()
    )
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

/// Changes null values to a no information label
Map noInformation(Map input) => input..keys.forEach((key) {
    var value = input[key];
    if (value == null) {
        input[key] = 'no information';
    }
});

/// Wraps the courses in a body with a date and a count
Map createWrapper(List<List> pageTypes) => {
    'courses': pageTypes[0],
    'projects': pageTypes[1],
    'program': pageTypes[2],
    'subject': pageTypes[3],
    'coursesCount': pageTypes[0].length,
    'projectsCount': pageTypes[1].length,
    'programCount': pageTypes[2].length,
    'subjectCount': pageTypes[3].length,
    'timestamp': new DateTime.now().toIso8601String(),
};
