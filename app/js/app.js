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

    var $predictionFrom = $('form'),
        $button = $('button', $predictionFrom),
        $result = $('#result'),
        $resultError = $('.alert', $result),
        $resultArrow = $('.arrow', $result),
        $resultConfidence = $('.confidence strong', $result);

    // Reset result element on form inputs change
    $('input', $predictionFrom).on('change', function() {
        $resultError.html(null).hide();

        $resultArrow.removeClass('up down');
        $resultConfidence.html('?');
    });

    // Prevents from multiple form submit
    $button.on('click', function(e) {
        e.preventDefault();

        if ($button.hasClass('disabled')) {
            return false;
        }
        $button.addClass('disabled');

        $predictionFrom.trigger('submit');
    });


    // Submit the prediction form
    $predictionFrom.on('submit', function(e) {
        e.preventDefault();

        normalizeYesterdayClose();
        normalizeOpen();

        /*
         * Prepare input_data dictionary:
         * { field_id_1 : value_1, .., field_id_n : value_n }
         */
        var inputData = {};
        $('.input-data', $predictionFrom).each(function() {
            var $this = $(this);
            inputData[$this.attr('name')] = $this.val();
        });

        $resultError.html(null).hide();
        $resultArrow.removeClass('up down');
        $resultConfidence.html('?');
        $button.addClass('loading');

        // https://bigml.com/developers/predictions#p_create
        var postData = {
            model: modelResource,
            input_data: inputData,
            tags: ['BigMLWorkshop'] // Optional (just for filter predictions)
        };

        console.log("Input data: " + JSON.stringify(inputData));

        $.ajax({
            url: 'https://bigml.io/andromeda/prediction?' + BIGML_AUTH,
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(postData),
            success: function(prediction) {

                $button.removeClass('disabled loading');

                if (prediction.status.code == FINISHED) {
                    // Prediction created successfully. Render result
                    $resultArrow.addClass(prediction.output.toLowerCase());

                    $resultConfidence.html(
                        (prediction.confidence * 100).toFixed(2) + '%'
                    );
                } else {
                    // An error happended creating the prediction.
                    $resultError.html(
                        prediction.status.message
                    ).show();

                    $resultArrow.addClass('up down');
                    $resultConfidence.html('!');
                }

                console.log(prediction);
            },
            error: function(error) {
                // An error happended creating the prediction.
                $button.removeClass('disabled loading');

                var message = 'Something went wrong creating the prediction.';
                if (error.responseJSON &&
                    error.responseJSON.status &&
                    error.responseJSON.status.message) {

                    message = error.responseJSON.status.message;
                }
                $resultError.html( message ).show();

                $resultArrow.addClass('up down');
                $resultConfidence.html('!');

                console.log(error);
            }

        });
    });
});
