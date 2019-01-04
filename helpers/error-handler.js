const errorHandler = (err, req, res, next)=>{
    console.log('error');
    if (typeof (err) === 'string') {
        // custom application error        
        return res.json({'status':400,'error':err});	
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error      
        return res.json({'status':401,'error':'Invalid Token'});
    }

    // default to 500 server error
    return res.json({'status':500,'error':err.message});
}


module.exports = Object.assign({}, {errorHandler})
