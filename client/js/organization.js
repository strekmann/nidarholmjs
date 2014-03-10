module.exports.memberlistView = function () {
};

module.exports.userView = function () {
    $('#addgroup form').hide();
    $('#addgroup').on('click', '.new_group', function (event) {
      $(this).hide();
      $(this).siblings().show();
    });
    $('#addgroup').on('click', '.reset', function (event) {
      var form = $(this).parents('form');
      form.hide();
      form.siblings().show();
    });
    $('#addgroup form').on('submit', function (event) {
      event.preventDefault();
      var self = this;
      var username = $('#username').attr('data-username'),
          group = $('#group').val();

      $.ajax({
        url: '/users/' + username + '/groups',
        type: 'post',
        data: {
            groupid: group
        },
      success: function (group) {
        console.log(group);
        $(self).hide();
        $(self).siblings().show();
        var templ = '<li class="group" data-id="' + group._id + '">' + group.name + '<a href="#" class="removegroup"><i class="fa fa-minus"></a></li>';

        $('#groups').append(templ);
        }
      });
    });

    $('#groups').on('click', '.removegroup', function (event) {
      event.preventDefault();
      var username = $('#username').attr('data-username'),
          group = $(this).parents('.group'),
          groupid = group.attr('data-id');
          console.log(group);

      $.ajax({
        url: '/users/' + username + '/groups/' + groupid,
        type: 'delete',
        success: function () {
          group.remove();
        }
      });
    });
};
