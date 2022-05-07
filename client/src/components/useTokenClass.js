class Token {
    constructor() {
        this.getToken()
    }

    token = undefined
    getToken = function () {

        this.token = localStorage.getItem('token');
        let expiry = localStorage.getItem("expiry");

        if(this.token == null) this.token = undefined
        if(expiry == null) expiry = undefined

        // console.log(expiry, this.token)
        // console.log(this.token === undefined , expiry === undefined,  parseInt(expiry)  > Date.now())
        if (this.token === undefined || expiry === undefined ||  parseInt(expiry)  < Date.now()) {


            this.token = undefined;

            localStorage.removeItem('token');
            localStorage.removeItem("expiry");

            return
        }

        let newExpiry = Date.now() + 30 * 60 * 1000;
        // console.log("Settam")
        localStorage.setItem('expiry',newExpiry + "");

    }.bind(this)

    saveToken = function (userToken) {
        // console.log("Setting user token", userToken)

        let expiry = Date.now() + 30 * 60 * 1000
        localStorage.setItem('token',userToken);
        localStorage.setItem('expiry', expiry + "")

        this.token = userToken
    }.bind(this)
    deleteToken = function () {
        try {
            localStorage.removeItem('token')
            localStorage.removeItem('expiry')
        } catch {
            console.log("Token not in local storage")
        }
        this.token = undefined;
    }.bind(this)


}

export const auth = new Token()