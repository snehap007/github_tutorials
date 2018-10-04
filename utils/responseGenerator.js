exports.getResponse = function (status, msg, records) {

    var response = {
        "Status" : status,
        "Message" : msg,
        "Data" : records,
        "ErrorMessage" : "",
        "URL" : ""
    }
    return response;
}