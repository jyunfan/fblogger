// ==UserScript==
// @name        facebook
// @namespace   ypcat.csie.org
// @include     https://www.facebook.com/
// @version     1
// @grant       GM_xmlhttpRequest
// @require     http://code.jquery.com/jquery.min.js
// ==/UserScript==

$(function(){
    /*
    function debug(msg) {
      console.debug(msg);
    }

    function id_exist(id) {
      return undefined !== localStorage[id];
    }

    function id_save(id) {
      localStorage[id] = 1;
    }

    function sendtosplunk(data) {
      host = 'localhost';
      $.ajax({
        type: "POST",
        url: 'https://' + host + ':8089/services/receivers/simple?source=post&sourcetype=facebook',
        dataType: 'xml',
        async: false,
        username: 'admin',
        password: 'changeme',
        data: data,
        success: function (){
          debug('send succeeded');
        },
        error: function(jqXHR, textStatus, errorThrown ) {
          debug('send failed\n' + textStatus + errorThrown);
        }
      });
    }

    function getstory() {
        //debug('run at ' + new Date());
        var _this = this;
        var items = [];
        $('li.uiStreamStory').each(
            function(index){
              if (! this.attributes['data-ft']) { return; }
              r = this.attributes['data-ft'].textContent.match(/mf_story_key":"([\-\d]+)/);
              var ssid   = r[1];
              var author = $('div.actorDescription a', this).text();
              var msg    = $('span.messageBody', this).text();

              item = {'ssid':ssid, 'auther':author, 'msg':msg};
              if (!id_exist(ssid)) {
                id_save(ssid);
                debug('ssid='+ssid);
                debug('author='+author);
                items.push(item);
                sendtosplunk(JSON.stringify(item));
              }

              //sendtoelastic(ssid, item);
              //debug('msg='+msg);
              //UFICommentBody
            });
        return items;
    }

    if (!document.fblogger_defined) {
      document.fblogger_defined = true;
      setInterval(function() {
        items = getstory();
      }, 5000);
      debug('registered');
    }
    */

    var last_story = 0;
    $('#home_stream').on('DOMNodeInserted', function(){
        var data = [];
        $('li.uiStreamStory').slice(last_story).each(function(){
            if (! this.attributes['data-ft']) { return; }
            r = this.attributes['data-ft'].textContent.match(/mf_story_key":"([\-\d]+)/);
            var id   = r[1];
            var user = $('div.actorDescription a', this).text();
            var msg  = $('span.messageBody, .uiStreamAttachments', this).text();
            var link = $('.uiStreamSource a', this).first().attr('href');
            //console.log(id,user,msg);
            if(id && user && msg){
                $.ajax({
                    url: 'http://jftsai.csie.org/facebook/post/' + id,
                    type: 'PUT',
                    crossDomain: true,
                    data: JSON.stringify({user:user, msg:msg, link:link})
                });
            };
        });
        // post data
        last_story = $('li.uiStreamStory').length;
    });

    // search
    $('#pagelet_home_stream').prepend(
        $('<div>').append('<label>search</label>').append(
            $('<input>').attr('type', 'text').keypress(function(event){
                if(event.which == 13){
                    event.preventDefault();
                    var query = $(this).val();
                    $.ajax({
                        url:'http://jftsai.csie.org/facebook/post/_search',
                        type:'POST',
                        data:JSON.stringify({"query":{"text":{"msg":query}}}),
                        success: function(data){
                            var ul = $('#search_result').empty().append('<ul>').find('ul');
                            $.map(data.hits.hits, function(i){
                                var post = i._source;
                                $('<li>').append(
                                    $('<a>').text(post.user).attr('href', post.link),
                                    ': ' + post.msg
                                ).appendTo(ul);
                            });
                        }
                    });
                    $(this).val('');
                }
            })
        ).append('<div id="search_result">')
    );
});

