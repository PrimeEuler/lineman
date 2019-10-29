//  dependencies
var ansi    = require('ansi-escape-sequences');
var inspect = require('util').inspect;
var lineman = require('../');
var lexer   = require('./lexer');

//  line discipline
var lex     = new lexer()
var ldisc   = new lineman()
var prompt  = 'ldisc';
var store   = '';
var carrot  = '>';
var debug   = false
var respond = false;
var request = false;
var access  = { user:'', accept:false }
//  shell

var print   = function(object){
    ldisc.io.write('\r\n' + inspect(object,false,10,true) + '\r\n')
}
var echo    = function(text){
//  horizontal scrolling
    var min     = prompt.length + carrot.length
    var max     = ldisc.columns
    var range   = max-min
    var total   = min + text.buffer.length
    var over    = total - max
    var r_dent  = text.buffer.length - text.index 
    var l_dent  = over  
    var cursor  = min + text.index + 1
    var line    = text.buffer
        if(over > 0){ 
            cursor = (max - r_dent) + 1
            if( r_dent > range ){
                l_dent = over - (r_dent - range);
                cursor = min + 1
            }
            line = text.buffer.slice( l_dent, l_dent+range) ;
        }
// TODO: multi-line support    
    
//  ansi echo
    return  ansi.erase.inLine(2) + 
            ansi.cursor.horizontalAbsolute(1) + 
            ansi.style.green +
            prompt +
            ansi.style.magenta +
            carrot + 
            ansi.style.cyan +
            line + 
            ansi.cursor.horizontalAbsolute(cursor) +
            ansi.style.reset 
}
var ask     = function(text, callback, silent){
    ldisc.silent  = silent || false
    request = true
    store   = prompt
    prompt  = text
    carrot  = ':'
    respond = function(response){
        ldisc.silent = false
        ldisc.io.write('\r\n')
        prompt  = store
        carrot  = '>'
        request = false
        respond = false
        callback(response)
    }
    ldisc.io.write( echo({ buffer:'', index:0  } ))
}
var kill    = function(){
    ldisc.end()
    process.stdin.setRawMode( false )
    process.exit()
}
var user    = function(text){ return true } //text === 'root' }
var pass    = function(text){ return true } //text === 'toor' }
var auth    = function(){ 
        ask('username', function( username ){
            access.user = username
            if(user(username)){
               ask('password', function( password ){
                    access.accept = pass(password)
                    prompt = username
                    print(access)
                    access.accept?null:kill()
                },true)     
            }else{
                print(access)
                kill()
            }
        },false) }
var evil    = function(text){
    var result
    try{ result = eval( text ) }catch( e ){ result = e }
    
    if( typeof result === "undefined" ){
        ldisc.io.write('\r\n')
    }else{
        print( result ) 
    }
}

//  events    
    ldisc.on('keypress',    function(text){
        debug?print(lex.tokenize(text.buffer)):null
        ldisc.io.write(echo(text))
    })
    ldisc.on('mousepress',  function(info){
        debug?print({mousepress:info}):null
    })
    ldisc.on('cursor',      function(info){
        debug?print({cursor:info}):null
    })
    ldisc.on('resize',      function(info){
         debug?print({ size:info }):null
    })
    ldisc.on('ctrl',        function(key){
        debug?print(key):null
        //node readline defaults
        switch (key.name) {
                case 'c':
                    kill()
                    break;
                case 'h': // delete left
                    break;
                case 'd': // delete right or EOF
                    break;
                case 'u': // delete the whole line
                    break;
                case 'k': // delete from cursor to end of line
                    break;
                case 'a': // go to the start of the line
                    break;
                case 'e': // go to the end of the line
                    break;
                case 'b': // back one character
                    break;
                case 'f': // forward one character
                    break;
                case 'l': // clear the whole screen
                    break;
                case 'm': // return
                    break;
                case 'n': // next history item
                    break;
                case 'p': // previous history item
                    break;
                case 'z':
                    break;
                case 'w': // delete backwards to a word boundary
                case 'backspace':
                    break;
                case 'delete': // delete forward to a word boundary
                    break;
                case 'left':// move word left
                    break;
                case 'right'://move word right
                    break;
                }
    })
    ldisc.on('ctrl-shift',  function(key){
        debug?print(key):null
        //node readline defaults
        switch (key.name) {
          case 'backspace'://_deleteLineLeft();
            break;
          case 'delete'://_deleteLineRight();
            break;
        }
    })
    ldisc.on('meta',        function(key){
        debug?print(key):null;
        //node readline defaults
        switch (key.name) {
            case 'b': // move left one word
                break;
            case 'f': // move right one word
                break;
            case 'd': // delete word right
            case 'delete':
                break;
            case 'backspace': // delete word left
                break;
        }
    })
    ldisc.on('navigate',    function(key){
        debug?print(key):null
        //node readline defaults
        switch( key.name ){
            case 'up'://default previous history
                break;
            case 'down'://default next history
                break;
            case 'left'://default cursor left
                break;
            case 'right'://default cursor right
                break;
            case 'pageup':    
                break;
            case 'pagedown':
                break;
            case 'home':
                break;
            case 'end': 
                break;
            case 'tab':
                print(ldisc.getText())
                ldisc.setText({ buffer:'tab', index:10})
                break;
        }
                
    })
    ldisc.on('edit',        function(key){
        debug?print(key):null
        switch(key.name){
            case 'delete'://delete character rigth
                break;
            case 'backspace'://delete character left
                break;
            case 'insert'://insert mode
                break;
        }
    })
    ldisc.on('csi',         function(key){
        debug?print(key):null
    })
    ldisc.on('crlf',        function(text){
        if( request===true ){ 
            respond( text.buffer )
        }else{
            evil( text.buffer )
        }
    })
    ldisc.on('close',       kill )
    ldisc.setSize( process.stdout )    
    
//  terminal emulator process    
    if(process.stdin.isTTY){
        process.stdin.setRawMode( true )
    }
//  connect terminal emulator to line discipline
    process.stdin.pipe( ldisc  ).pipe( process.stdout )
//  listen for terminal resizeing
    process.stdout.on('resize', function() {
        ldisc.setSize( process.stdout )
    })
//  authenticate 
    auth()
    
    


