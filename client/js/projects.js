module.exports.projectListView = function () {
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

module.exports.projectView = function () {
    $('#events').on('click', '.deleteevent', function (event) {
        event.preventDefault();
        var url = $(this).attr('href');
        var projectevent = $(this).parents('.event');
        $.ajax({
            url: url,
            type: 'delete',
            success: function (data) {
                $('flash').append('<div data-alert class="alert-box success">' + data + '</div>');
                projectevent.remove();
            }
        });
    });
};
