import 'dart:io';
import 'dart:convert';

main() {
    new File('scrapedata.json')
        .readAsString()
        .then(JSON.decode)
        .then((obj) => (obj['courses'] as List)
            .map((course) => course['name']).toList()
        ).then((List list) {
            list.sort();
            list.forEach(print);
        });
}
