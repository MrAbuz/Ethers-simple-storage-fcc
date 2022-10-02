const ethers = require("ethers")
const fs = require("fs-extra")

// 7:07:28

async function main() {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    let wallet = new ethers.Wallet(
        "7373e9994df29a5f1d83976bed3819d964640505069b56cdc825c7788f9fe1da",
        provider
    )

    const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
    const binary = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.bin",
        "utf8"
    )

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
    const contract = await contractFactory.deploy()
    await contract.deployTransaction.wait(1)

    const currentFavoriteNumber = await contract.retrieve()
    console.log(`Current Favorite Number: ${currentFavoriteNumber.toString()}`)
    const transactionResponse = await contract.store("7")
    const transactionReceipt = await transactionResponse.wait(1)
    const updatedFavoriteNumber = await contract.retrieve()
    console.log(`Updated Favorite Number: ${updatedFavoriteNumber}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
