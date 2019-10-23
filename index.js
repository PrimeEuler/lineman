var stream      = require('stream');
var keypress    = require('./keypress');
String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};
String.prototype.del = function (idx) {
    return (this.slice(0, idx - 1) + this.slice(idx));
};
function lineman(){
    var text    = {
        buffer:'',
        cursor:{
            row:0,
            column:0
        }
    }
    var history = {
        buffer:[''],
        index:0
    }
    var self    = new stream.Duplex({
        objectMode:true,
        read:function(size){},
        write:function(chunk, encoding, callback){
            if(self.io.push(chunk)){callback()}
        }
    })
        self.io = new stream.Duplex({
        objectMode:true,
        read:function(size){},
        write:function(chunk, encoding, callback){
            if(self.push(chunk)){callback()}
        }
    })
        keypress( self.io )
        self.io.on('keypress',     keymap )
        function keymap(ch, key){
            key = key || { name:'', sequence:'' };
            key.name = key.name || ''
            if( key.ctrl && key.shift ) {
                self.emit( 'ctrl-shift',  key.name )
            }
            else if( key.ctrl ) {
                self.emit( 'ctrl',  key )
                return
            }
            else if( key.meta ) {
                self.emit( 'meta',  key )      
            }
            else if( key.name.match(/^(up|down|left|right|pageup|pagedown|home|end)$/) ) {
                navigate( key )
                self.emit('navigate', key )
            }
            else if( key.name.match(/^(delete|backspace|insert|tab)$/) ) {
                edit( key )
                self.emit('edit', key )
            }
            else if( key.name.match(/^(enter|return)$/) ) {
                self.emit( 'crlf',  JSON.parse(JSON.stringify(text)) ) 
                if(text.buffer.length > 0){
                    
                    
                    history.buffer.push(text.buffer);
                    history.index = history.buffer.length 
                    
                }
                text.buffer = '';
                text.cursor.column = 0;
            }
            else if( key.sequence.indexOf('\u001b') ===0){
                self.emit('csi', key )
            }else{
                if(!ch){
                    if(key.sequence){
                        ch = key.sequence
                    }else
                    {
                        ch=''
                    }
                }
                text.buffer = text.buffer.splice(text.cursor.column,0,ch)
                text.cursor.column += ch.length
            }
            self.emit('keypress',text)
            
        }
        function navigate( key ){
            switch( key.name ){
                case 'up':
                    if( history.index > 0){
                        history.index--
                        text.buffer = history.buffer[history.index] || ''
                        text.cursor.column = text.buffer.length
                    }
                    break;
                case 'down':
                    if( history.index < history.buffer.length - 1){
                        history.index++
                        text.buffer = history.buffer[history.index]
                        text.cursor.column = text.buffer.length
                    }
                    break;
                case 'left':
                    if( text.cursor.column > 0){
                        text.cursor.column --
                    }
                    break;
                case 'right':
                    if( text.cursor.column < text.buffer.length ){
                        text.cursor.column ++
                    }
                    break;
                case 'pageup':    
                    
                    break;
                case 'pagedown':
                    
                    break;
                case 'home':
                    
                    break;
                case 'end': 
                    
                    break;
            }
        }
        function edit( key ){
            switch( key.name ){
                case 'delete':
                    if(text.buffer.length > 0 && text.cursor.column >= 0){
                        text.buffer = text.buffer.del(text.cursor.column + 1)
                    }
                    break;
                case 'backspace':
                    if(text.buffer.length > 0 && text.cursor.column > 0){
                        text.buffer = text.buffer.del(text.cursor.column)
                        text.cursor.column--
                    }
                    break;
                case 'insert':
                case 'tab':
            }
    
        }
        
        self.setText    = function(txt){
            text = JSON.parse(JSON.stringify(txt))
        } 
        self.getText    = function(){
            return text
        }  
        
        
    return self
}
module.exports  = lineman