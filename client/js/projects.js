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
