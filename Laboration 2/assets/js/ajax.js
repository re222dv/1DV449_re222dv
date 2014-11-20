function ajax(url, body, callback) {
    if (typeof body == 'function') {
        callback = body;
        body = '';
    }
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            try {
                var response = JSON.parse(xhr.responseText);
                callback && callback(response);
            } catch(e) {
                callback && callback();
            }
        }
    };

    if (body != '') {
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('Connection', 'close');
    } else {
        xhr.open('GET', url, true);
    }

    xhr.send(JSON.stringify(body));
}

function get(url, callback) {
    ajax(url, callback);
}

function post(url, body, callback) {
    body = body || {};
    ajax(url, body, callback);
}
