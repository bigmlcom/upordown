$(function() {
    var HTTP_OK = 200,
        HTTP_404 = 404,
        FINISHED = 5,
        FAULTY = -1;

    var BIGML_USERNAME = 'osroca',
        BIGML_API_KEY = '2ce66ca39d5935f9b0183c467cb0c39ab29a5783',
        BIGML_AUTH = 'username=' + BIGML_USERNAME + ';api_key=' + BIGML_API_KEY;
        modelResource = 'model/53677266ffa044517f00984b';

    /*
     * Price at closing of the previous day minus the price at opening
     * over the price at closing of the previous day.
     */
    function normalizeOpen() {
        var yClose = $('#id_close-1').val(),
            open = $('#id_open').val(),
            nOpen = 0;

        nOpen = (yClose - open) / yClose;
        nOpen = isNaN(nOpen) ? 0 : nOpen;

        $('#id_n_open').val(nOpen);

        console.log("Normalized Open: " + nOpen);
    }

    /*
     * Price at closing of the previous day minus the price at opening
     * of the previous day over the price at opening of the previous day.
     */
    function normalizeYesterdayClose() {
        var yClose = $('#id_close-1').val(),
            yOpen = $('#id_open-1').val(),
            nYClose = 0;

        nYClose = (yClose - yOpen) / yClose;
        nYClose = isNaN(nYClose) ? 0 : nYClose;

        $('#id_n_close-1').val(nYClose);

        console.log("Normalized Yesterday Close: " + nYClose);
    };

    normalizeYesterdayClose();
    normalizeOpen();

    var $predictionFrom = $('form');

    $predictionFrom.on('submit', function(e) {
        e.preventDefault();

        normalizeYesterdayClose();
        normalizeOpen();

        var inputData = {};
        $('.input-data', $predictionFrom).each(function() {
            var $this = $(this);
            inputData[$this.attr('name')] = $this.val();
        });

        var postData = {
            model: modelResource,
            input_data: inputData
        };

        console.log("Input data: " + JSON.stringify(inputData));

        $.ajax({
            url: 'https://bigml.io/andromeda/prediction?' + BIGML_AUTH,
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(postData),
            success: function(prediction) {
                console.log(prediction);
            },
            error: function(error) {
                console.log(error);
            }

        });
    });
});
