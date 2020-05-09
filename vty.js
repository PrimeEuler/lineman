var stream      = require('stream');
function vty(){
    //endpiont input/output
    var eio      = this;
        eio.src  = new stream.Duplex({
            objectMode:true,
            read:function(size){},
            write:function(chunk, encoding, callback){
                if(eio.dst.push(chunk) ){
                    callback()
                }else{
                    //pause source endpoint
                    console.log('pause source endpoint' )
                    callback()
                }
            }
        });
        eio.dst  = new stream.Duplex({
            objectMode:true,
            read:function(size){},
            write:function(chunk, encoding, callback){
                if(eio.src.push(chunk)){
                    callback()
                    
                }else{
                    //pause destination
                    console.log('pause destination endpoint' )
                    callback()
                }
            }
            
        });
        
        eio.src.on('pipe',function( endpoint ){
            console.log('source endpoint:', endpoint )
        });
        eio.dst.on('pipe',function( endpoint ){
            console.log('destination endpoint:', endpoint )
        });
        return eio
        
};

module.exports = vty

