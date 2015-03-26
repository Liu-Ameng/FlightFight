FF.MessageController = function() {
    this.$container = $('#left-message');
};

FF.MessageController.prototype.append = function(msg, className) {
    if (className === undefined) {
        className = 'info';
    }
    msg = $('<div/>').text(msg).html();
    var html = '<div class="alert alert-' + className + '" role="alert">' + msg + '</div>';
    if ($('#left-message .alert').length > 8) {
        $('#left-message .alert')[0].remove();
    }
    this.$container.append(html);

};