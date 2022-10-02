//this is some code that we're gonna use to encrypt the key and store that locally instead of having the private key in plain text.

const ethers = require("ethers")
const fs = require("fs-extra")
require("dotenv").config()

async function main() {
    //we're gonna set this script up to run our encrypt key one time and then remove our private key from anywhere in the work space so its no longer in plain text anywhere.
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
    const encryptedJsonKey = await wallet.encrypt(
        process.env.PRIVATE_KEY_PASSWORD,
        process.env.PRIVATE_KEY
    )
    console.log(encryptedJsonKey) //this encrypt function returns an encrypted json key that we can store locally, and that someone can only decrypt it with the password.
    //
    fs.writeFileSync("./.encryptedKey.json", encryptedJsonKey) // now that we encrypted it, we're gonna save it. Saving into a new file called .encryptedKey.json that is automatically created
    //after this we delete our PRIVATE_KEY and PRIVATE_KEY_PASSWORD from the .env file so that it isn't no longer in plain text.
    //antes de encriptar o ficheiro tenho obviamente que ter a PRIVATE_KEY e PRIVATE_KEY_PASSWORD declaradas no .env file para agora apagar.
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
