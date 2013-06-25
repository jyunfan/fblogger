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
