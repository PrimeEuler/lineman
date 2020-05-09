var stream      = require('stream');
var keypress    = require('./keypress');
String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};
String.prototype.del = function (idx) {
    return (this.slice(0, idx - 1) + this.slice(idx));
};
function lineman(){
    var text        = {
        buffer:'',
        index:0
    }
    var history     = {
        buffer:[''],
        index:0
    }
    var ldisc       = new stream.Duplex({
        objectMode:true,
        read:function(size){},
        write:function(chunk, encoding, callback){
            //if(ldisc.io.push(chunk)){callback()}
            ldisc.io.push(chunk)
            callback()
        }
    })
        ldisc.io    = new stream.Duplex({
        objectMode:true,
        read:function(size){},
        write:function(chunk, encoding, callback){
            //if(ldisc.push(chunk)){callback()}
            ldisc.push(chunk)
            callback()
        }
    })
        ldisc.isRaw = false;
        ldisc.columns   = 80
        ldisc.rows      = 24
        
        keypress( ldisc.io )
        
        ldisc.io.on('keypress',   keymap )
        ldisc.io.on('mousepress', function(info){
            ldisc.emit('mousepress',info)
        })
        ldisc.io.on('cursor',     function(info){
            ldisc.emit('cursor',info)
        })
        
        //minimal line discipline
        function keymap( ch, key ){
            if(ldisc.isRaw===true){return}
            key = key || { name:'', sequence:'' };
            key.name = key.name || ''
            if( key.ctrl && key.shift ) {
                ldisc.emit( 'ctrl-shift',  key.name )
            }
            else if( key.ctrl ) {
                ldisc.emit( 'ctrl',  key )
                return
            }
            else if( key.meta ) {
                ldisc.emit( 'meta',  key )      
            }
            else if( key.name.match(/^(up|down|left|right|pageup|pagedown|home|end|tab)$/) ) {
                navigate( key )
                ldisc.emit('navigate', key )
            }
            else if( key.name.match(/^(delete|backspace|insert)$/) ) {
                edit( key )
                ldisc.emit('edit', key )
            }
            else if( key.name.match(/^(enter|return)$/) ) {
                if(text.buffer.length > 0 && ldisc.silent===false){
                    history.buffer.push(text.buffer);
                    history.index = history.buffer.length 
                }
                ldisc.emit( 'crlf',  unmarshall(text) ) 
                text.buffer = '';
                text.index = 0;
            }
            else if( key.sequence.indexOf('\u001b') ===0){
                ldisc.emit('csi', key )
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
            if(ldisc.silent===false)
            ldisc.emit('keypress', unmarshall(text))
            
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
                case 'tab':
                    break;
            }
        }
        function edit( key ){
            switch( key.name ){
                case 'delete':
                    if(text.buffer.length > 0 && text.index >= 0){
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
            }
    
        }
        function unmarshall( object ){
            return JSON.parse(JSON.stringify(object))
        }
        
        ldisc.silent    = false
        ldisc.setText   = function(txt){
            text = unmarshall( txt )
            if(text.index>text.buffer.length ){
                text.index = text.buffer.length
            }
            if(ldisc.silent===false)
            ldisc.emit('keypress', unmarshall(text))
        } 
        ldisc.getText   = function(){
            return unmarshall( text )
        }  
        ldisc.mouseOn   = function(){
            keypress.enableMouse(ldisc.io)
        }
        ldisc.mouseOff  = function(){
            keypress.disableMouse(ldisc.io)
        }
        ldisc.getCursor = function(){
             keypress.getCursor(ldisc.io)
        }
        ldisc.setSize   = function(size){
            ldisc.columns = size.columns
            ldisc.rows    = size.rows
            ldisc.emit('resize',[ldisc.columns, ldisc.rows ])
            //ldisc.getCursor()
        }
        ldisc.getSize   = function(){
            return [ldisc.columns, ldisc.rows ]
        }
        
    return ldisc
}
module.exports  = lineman