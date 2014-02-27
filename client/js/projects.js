module.exports.projectListView = function () {
    $('#newprojectform').on('submit', function (event) {
        event.preventDefault();
        $.ajax({
            url: '/projects',
            type: 'post',
            data: {
                title: $('#title').val(),
                tag: $('#tag').val(),
                private_mdtext: $('#private_mdtext').val(),
                public_mdtext: $('#public_mdtext').val(),
                start: $('#start').val(),
                end: $('#end').val()
            },
            success: function (data) {
                $('#flash').append('<div data-alert class="alert-box success">' + data + '</div>');
                $('#newprojectform')[0].reset();
            }
        });
    });
    $('#projects').on('click', '.deleteproject', function (event) {
        event.preventDefault();
        var project = $(this).parents('.project');
        var id = project.attr('data-id');
        $.ajax({
            url: '/projects/' + id,
            type: 'delete',
            success: function (data) {
                $('#flash').append('<div data-alert class="alert-box success">' + data + '</div>');
                project.remove();
            }
        });
    });
};
