class Token {
    token = undefined
    getToken = function () {
        this.token = sessionStorage.getItem('token')
    }.bind(this)

    saveToken = function (userToken) {
        console.log("Setting user token", userToken)
        sessionStorage.setItem('token', userToken);
        this.token = userToken
    }.bind(this)


}

const token = new Token()
export default token