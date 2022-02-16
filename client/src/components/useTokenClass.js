class Token {
    constructor(){
        this.getToken()
    }
    token = undefined
    getToken = function () {
        this.token = undefined;
        this.token = localStorage.getItem('token')
        if (this.token == null){
            this.token = undefined;
        }
        console.log("Non existant", this.token)
    }.bind(this)

    saveToken = function (userToken) {
        console.log("Setting user token", userToken)
        localStorage.setItem('token', userToken);
        this.token = userToken
    }.bind(this)
    deleteToken = function(){
        localStorage.removeItem('token')
        this.token = undefined;
    }.bind(this)


}

export const auth = new Token()