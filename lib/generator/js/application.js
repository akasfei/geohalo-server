!function ($) {

  $(function(){
    $.post('/stats', {}, function (data) {
      if (data.active) {
        $('.user-stats').append('<h1>' + data.name + '</h1><p>' + data.email + '</p>').addClass('active');
        $('.login-form').removeClass('active');
      }
    }, 'json');

    $('.login-form .btn-login').click(function (e) {
      var logindata = $('.login-form form').serialize();
      $.post('/login', logindata, function (data) {
        if (data.ok) {
          location.reload();
        } else {
          alert(data.err);
        }
      }, 'json');
    });
})

}(window.jQuery)
