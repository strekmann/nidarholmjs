module.exports = {
    indexView: function(){
        var ractive = new Ractive({
            el: '#ractive',
            template: '#tmpl-test'
        });
    }
};