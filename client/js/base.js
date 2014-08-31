var Register = Ractive.extend({
    checkEmail: function (email) {
        return $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/login/check_email',
            data: {
                email: email
            }
        });
    },
    sendResetPasswordEmail: function (email) {
        return $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/login/reset',
            data: {
                email: email
            }
        });
    }
});


module.exports = {
    indexView: function(activities){
        var ractive_activities = new Ractive({
            el: '#activities',
            template: '#activity-template',
            data: {
                activities: activities,
                ago: function (date) {
                    return moment(date).from();
                },
                marked: function (text) {
                    return marked(text);
                },
                last: function (array) {
                    return array.slice(-1)[0];
                }
            }
        });
    },

    registerView: function () {
        var registermodal = new Ractive({
            el: '#register-modal',
            template: '#register-modal-template'
        });
        var resetpasswordmodal = new Ractive({
            el: '#reset-password-modal',
            template: '#reset-password-modal-template'
        });
        var ractive = new Register({
            el: '#register',
            template: '#register-template',
        });

        ractive.on('registerEmail', function (event) {
            event.original.preventDefault();

            ractive.checkEmail(event.context.email)
            .then(function (data) {
                if (data.status) {
                    ractive.sendResetPasswordEmail(event.context.email)
                    .then(function (data) {
                        resetpasswordmodal.set('warning', "Du finnes allerede i brukerdatabasen. En epost for å nullstille passordet har blitt sendt.");
                        $('#reset-password-modal').foundation('reveal', 'open');
                    }, function (error) {
                        resetpasswordmodal.set('error', "Feil: " + error);
                        $('#reset-password-modal').foundation('reveal', 'open');
                    });
                }
                else {
                    registermodal.set('email', event.context.email);
                    $('#register-modal').foundation('reveal', 'open');
                    $('#register-form').foundation({bindings:'events'});

                    setTimeout(function() {
                        $('#name').focus();
                    }, 500);
                }
            });
        });
    }
};
