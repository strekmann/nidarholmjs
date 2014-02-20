module.exports.memberlistView = function () {
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
      var name = $('#name').val();
      $.ajax({
        url: '/members',
        type: 'post',
        data: {
          name: name,
          organization: 'nidarholm'
        },
        success: function (group) {
        $(self).hide();
        $(self).siblings().show();
        var templ = '<div class="group" data-id="' + group._id + '"><h2>' + group.name + '<a href="#" class="removegroup"><i class="fa fa-minus"></a></h2>';
        _.each(group.members, function (member) {
          templ += '<div><b>' + member.user.username + '</b></div>';
          templ += '<div>' + member.user.name + '</div>';
          templ += '<div>' + member.role + '</div>';
        });
        templ += '</div>';

        $('#memberlist').append(templ);
      }});
    });

    $('#memberlist').on('click', '.removegroup', function (event) {
      event.preventDefault();
      var group = $(this).parents('.group'),
          groupid = group.attr('data-id');

      $.ajax({
        url: '/members/' + groupid,
        type: 'delete',
        data: {
          organization: 'nidarholm'
        },
        success: function () {
        group.remove();
      }});
    });

    $('#memberlist').sortable().on('sortupdate', function (e, ui) {
      console.log(e);
      console.log(ui);
      _.each($('#memberlist .group'), function (group) {
        console.log(group);
      });
    });
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
