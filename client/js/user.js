module.exports.editUserView = function () {
    $("#postcode").keyup(function (event) {
        var value = $(this).val();
        value = value.replace(/\D/g,'');
        if (value.length === 4) {
            var url = '/proxy/postcode/' + value;
            $.ajax({
                url: url,
                success: function (data) {
                    $('#city').val(data.city);
                }
            });
        }
    });
    $("#country").chosen();
};
