// this endpoint code should be deployed to an endpoint named
// 'test' in the app against which the scenario tests run

function onRequest(request, response, modules){
    if(request.body.test == 'BADGER'){
        response.body = {status: 'OK'};
        response.complete();
    } else {
        response.error();
    }
}