library stream_functions;

import 'dart:async';

/// A filter that removes null events
bool notNull(expression) => expression != null;

/// Flattens a [Stream] of Streams to a Stream
final flatten = new StreamTransformer.fromHandlers(handleData: (value, sink) {
    value.listen(sink.add);
});
