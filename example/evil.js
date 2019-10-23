var ansi        = require('ansi-escape-sequences');
var inspect     = require('util').inspect;
var lineman     = require('../');

var repl    = new lineman()
var prompt  = 'repl';
var carrot  = '>';
var print   = function(object){
    repl.io.write('\r\n' + inspect(object,false,10,true) + '\r\n')
}
var echo    = function(text){
    return  ansi.erase.inLine(2) + 
            ansi.cursor.horizontalAbsolute(1) + 
            ansi.style.green +
            prompt +
            ansi.style.magenta +
            carrot + 
            ansi.style.cyan +
            text.buffer + 
            ansi.cursor.horizontalAbsolute(prompt.length + carrot.length + text.cursor.column + 1) +
            ansi.style.reset 
}
var init    = echo({ buffer:'', cursor:{ column:0 } } )
    repl.io.write( init )
    repl.on('keypress',function(text){
        repl.io.write(echo(text))
    })
    repl.on('ctrl',function(key){
        
        print(key)
        switch(key.name){
            case 'c':
                process.exit()
                break;
        }
    })
    repl.on('ctrl-shift',function(key){
        print(key)
    })
    repl.on('meta',function(key){
        print(key)
    })
    repl.on('navigate',function(key){
         print(key)
    })
    repl.on('edit',function(key){
         print(key)
         if(key.name==='tab'){
             print(repl.getText())
         }
    })
    repl.on('csi',function(key){
         print(key)
    })
    repl.on('crlf',function(text){
        var evil
        try{
            evil = eval(text.buffer)
        }catch(e){
            evil = e
        }
        print(evil)
        
    })
//terminal emulator process    
if(process.stdin.isTTY){
    process.stdin.setRawMode( true )
}
//connect terminal emulator to virtual terminal interface of the line 
process.stdin
        .pipe( repl  )
        .pipe( process.stdout )
process.stdout.on('resize', function(size) {
            repl.columns = process.columns
            repl.rows    = process.rows
            repl.emit('resize')
        })