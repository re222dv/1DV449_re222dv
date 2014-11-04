library stream_functions;

import 'dart:async';

bool notNull(expression) => expression != null;

final flatten = new StreamTransformer.fromHandlers(handleData: (value, sink) {
    value.listen(sink.add);
});
