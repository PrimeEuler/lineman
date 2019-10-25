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
        index:0
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
        self.silent = false
        keypress( self.io )
        
        self.io.on('keypress',   keymap )
        self.io.on('mousepress', function(info){
            self.emit('mousepress',info)
        })
        self.io.on('cursor',     function(info){
            self.emit('cursor',info)
        })
        
        function keymap( ch, key ){
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
                
                
                if(text.buffer.length > 0 && self.silent===false){
                    history.buffer.push(text.buffer);
                    history.index = history.buffer.length 
                }
                self.emit( 'crlf',  unmarshall(text) ) 
                text.buffer = '';
                text.index = 0;
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
                text.buffer = text.buffer.splice(text.index,0,ch)
                text.index += ch.length
            }
            if(self.silent===false)
            self.emit('keypress', unmarshall(text))
            
        }
        function navigate( key ){
            switch( key.name ){
                case 'up':
                    if( history.index > 0){
                        history.index--
                        text.buffer = history.buffer[history.index] || ''
                        text.index  = text.buffer.length
                    }
                    break;
                case 'down':
                    if( history.index < history.buffer.length - 1){
                        history.index++
                        text.buffer = history.buffer[history.index]
                        text.index  = text.buffer.length
                    }
                    break;
                case 'left':
                    if( text.index > 0){
                        text.index --
                    }
                    break;
                case 'right':
                    if( text.index < text.buffer.length ){
                        text.index ++
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
                    if(text.buffer.length > 0 && text.indexn >= 0){
                        text.buffer = text.buffer.del(text.index + 1)
                    }
                    break;
                case 'backspace':
                    if(text.buffer.length > 0 && text.index > 0){
                        text.buffer = text.buffer.del(text.index)
                        text.index--
                    }
                    break;
                case 'insert':
                case 'tab':
            }
    
        }
        function unmarshall( object ){
            return JSON.parse(JSON.stringify(object))
        }
        self.setText    = function(txt){
            text = unmarshall( txt )
        } 
        self.getText    = function(){
            return unmarshall( text )
        }  
        self.mouseOn    = function(){
            keypress.enableMouse(self.io)
        }
        self.mouseOff   = function(){
            keypress.disableMouse(self.io)
        }
        self.getCursor  = function(){
             keypress.getCursor(self.io)
        }
        self.setSize    = function(size){
            self.columns = size.columns
            self.rows    = size.rows
            self.emit('resize',[self.columns, self.rows ])
            //self.getCursor()
        }
        self.getSize    = function(){
            return [self.columns, self.rows ]
        }
        
    return self
}
module.exports  = lineman