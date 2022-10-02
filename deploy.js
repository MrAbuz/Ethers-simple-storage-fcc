const ethers = require("ethers") //import ethers into deploy.js script to use its tools //require is a function to import the ethers package
const fs = require("fs-extra") //to deploy we'll need to read from the ABI and the BIN (files from the compilation), to do that we'll need a package called FS.(acho que podia ser só "fs", se calhar estou-me a confundir, tentar se não der)
require("dotenv").config() //para ir buscar as nossas environment variables ao ficheiro .env (não damos assign a uma variável porque não vamos precisar de a chamar)
//1a maneira: criar .env file e chamar as variáveis com process.env.PRIVATE_KEY (p exemplo). Problema:As informações que queremos guardar estão escritas em plain text.
//2a maneira: em vez de usar o ficheiro .env porque posso ter medo de partilhar sem querer e leakar a private key, posso antes de dar node deploy.js escrever as variáveis que quero no terminal
//do género: RPC_URL=http://127.0.0.1:8545 PRIVATE_KEY=7373e9994df29a5f1d83976bed3819d964640505069b56cdc825c7788f9fe1da node deploy.js. É exatamente a mesma coisa. Com o ficheiro .env vazio. Brutal. (com as variáveis com process.env no código na mesma)
//3a maneira: encryptamos a private key e mudamos a meneira como chamamos a wallet: If someone hacks the key isnt in plain text e não escrevemos no terminal, requires a password to access it.
//Neste curso vamos usar a 1a maneira mas aprendi as 3, e no futuro profissionalmente irei usar a 3a se bem que pelo que percebi ainda há maneiras mais seguras.
//ENV PLEDGE: Quando usar real funds, nunca usar a 1a opção (escrever a key em algum lado). Usar SEMPRE a 2a ou 3a, ou um método de encryptação ainda mais avançado que não envolva escrever em lado nenhum.

//this is a normal setup of our scripts. at the top we import any dependencies or external packages; then we have our main function; then we call our main function at the bottom
//para executar este código criar ganache node com yarn add ganache  -> yarn run ganache e atualizar o código com o rpc url e uma das private keys obtidas. (dar save antes de dar deploy senão nao funca!!!)

async function main() {
    // script to deploy our SimpleStorage.sol
    let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL) //this is the way that our script is gonna connect to our blockchain   //conectei ao RPC URL da ganache node que criei //para definir o provider e wallet precisei do package ethers
    //
    let wallet = new ethers.Wallet( //atenção: em cima adicionar http:// antes do rpc url e na private key em baixo retirar o 0x. Perdi tempo atrás destes bugs
        process.env.PRIVATE_KEY, //we can access environment variables in javascript by using process.env. we never share our .env file with anybody. Environmental variable is a variable in our terminal or scripting environment.
        provider //em cima na private key no .env pus sem 0x, ethers e hardhat são espertos o suficiente que funciona com e sem, mas perceber que se tiver problemas posso necessitar de colocar 0x antes no .env.
    ) //the wallet takes a private key and a provider //fui buscar uma das privates keys ao ganache, mas acabei a usar ganache pelo command lane porque o ui nao funcionou com wsl
    //this two consts give us anything we need to interact with smart contracts, a connection to the blockchain and a wallet with a private key to sign different transactions
    /*
  // The above method is the simple method to get the wallet object diretly inserting the private key or taking it from the .env file, but using the encrypted way its as follows (Uso este código em baixo até ter o object da wallet para criar uma wallet com private key encryptada).
  const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8"); //this will read from the .encryptedKey.json, where we have our previous created wallet object (created in encryptKey.js) that is encrypted.
  let wallet = new ethers.Wallet.fromEncryptedJsonSync( //we use let because we have to connect it to the provider after
    encryptedJson,
    process.env.PRIVATE_KEY_PASSWORD // we'll input it manually on the terminal before node deploy.js because our .env file is already cleared obviously. "PRIVATE_KEY_PASSWORD=password node deploy.js"
    //after typing "PRIVATE_KEY_PASSWORD=password node deploy.js" in our terminal we must do history -c, because a hacker typing history in terminal can see previous actions and see the password.
  );
  wallet = await wallet.connect(provider); //to connect to the provider. Obviamente ao usar este código com a private key encryptada, nao uso a maneira normal da linha 18 de declarar a wallet.
  */
    const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8") //para definir o abi e o bin precisei de chamar o package FS no inicio. //utf8 = encoding usado no abi file
    const binary = fs.readFileSync(
        //estou a ler dois ficheiros que obtemos depois de compilar, ABI e BIN. Ver excel para ver como compilei com solcjs
        "./SimpleStorage_sol_SimpleStorage.bin",
        "utf8"
    ) //binary is the main compiled code, the really low level code.
    //
    const contractFactory = new ethers.ContractFactory(abi, binary, wallet) //in ethers the contractFactory is an object that we can use to deploy contracts
    console.log("Deploying, please wait...")
    const contract = await contractFactory.deploy() //we can then deploy this contract with ethers // await means to stop here, wait for contract to deploy and resolve the promise
    //overrides: we can add {} inside the deploy brackets to add different 'overrides' to specify for ex the gasPrice, or the gasLimit or anything we want. ".deploy({gasPrice: 10000000 });"
    //console.log(contract); //because we have the await it will return the promise, which will be a contract (está em // para executar as seguintes em vês desta, mas isto dá deploy ao contrato)
    console.log(`Contract Address: ${contract.address}`)

    /*const transactionReceipt = */ await contract.deployTransaction.wait(1) //transaction receipts: we can wait for a certain number of block confirmation to make sure our contract gets attached to the chain (here we wait for 1 block)
    //"Something I want you to take note is the 'transaction receipt' and the 'deployment transaction', I want you to separate this two because it will make your life a lot easier"
    //console.log("Here is the deployment transaction (transaction response): ");
    //console.log(contract.deployTransaction); //"Deployment transaction is what you get just when you create your transaction, what you get initially" when you deploy
    //console.log("Here is the transaction receipt: ");
    //console.log(transactionReceipt); //"You only get a transaction receipt when you wait for a block confirmation"  //esta distinção vai ser mais importante mais pra frente

    /*
  //Now, lets deploy this contract again but only purely using transaction data (raw way) (and learn how to send a transaction using only transaction data):

  console.log("Let's deploy with only transaction data!"); //"this is the way we can actually send transactions or deploy a contract purely specifying the transaction data, we can send any
  //transaction/create a contract(deploy a contract is a transaction), we have unlimited flexibility with the transactions we want to send."

  //an easier way to always get the right nounce will be to call the transaction count from the wallet. Porque o nounce ta sempre a aumentar em cada transação (extra para usar em tx).
  const nonce = await wallet.getTransactionCount();      //lindoo, assim vai sempre ler à minha wallet e não tenho que estar a atualizar a cada transação que faço

  const tx = {        Quando estamos a interagir com a blockchain estamos sempre a criar uma transação parecida com esta, que acontece no backend de ethers e hardhat. A data é o diferenciador. Nós vamos executar de uma maneira mais simples, mas no backend é isto que acontece
    nonce: nonce,
    gasPrice: 20000000000,  (fui ver estes valores à ganache node que criei no command line). Em baixo no video ele diz que devia ter posto "" aqui mas acabou a não pôr e eu tbm não e funcionou na mesma.
    gasLimit: 1000000,
    to: null, //como está nos transaction receipts, porque estamos a criar um contrato não estamos a enviar a transação para ninguém
    value: 0, //estamos a criar um contrato e nao queremos enviar native tokens
    data: "0x608060405234801561001057600080fd5b50610771806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80632e64cec11461005c5780636057361d1461007a5780636f760f41146100965780638bab8dd5146100b25780639e7a13ad146100e2575b600080fd5b610064610113565b604051610071919061052a565b60405180910390f35b610094600480360381019061008f919061046d565b61011c565b005b6100b060048036038101906100ab9190610411565b610126565b005b6100cc60048036038101906100c791906103c8565b6101b6565b6040516100d9919061052a565b60405180910390f35b6100fc60048036038101906100f7919061046d565b6101e4565b60405161010a929190610545565b60405180910390f35b60008054905090565b8060008190555050565b6001604051806040016040528083815260200184815250908060018154018082558091505060019003906000526020600020906002020160009091909190915060008201518160000155602082015181600101908051906020019061018c9291906102a0565b505050806002836040516101a09190610513565b9081526020016040518091039020819055505050565b6002818051602081018201805184825260208301602085012081835280955050505050506000915090505481565b600181815481106101f457600080fd5b906000526020600020906002020160009150905080600001549080600101805461021d9061063e565b80601f01602080910402602001604051908101604052809291908181526020018280546102499061063e565b80156102965780601f1061026b57610100808354040283529160200191610296565b820191906000526020600020905b81548152906001019060200180831161027957829003601f168201915b5050505050905082565b8280546102ac9061063e565b90600052602060002090601f0160209004810192826102ce5760008555610315565b82601f106102e757805160ff1916838001178555610315565b82800160010185558215610315579182015b828111156103145782518255916020019190600101906102f9565b5b5090506103229190610326565b5090565b5b8082111561033f576000816000905550600101610327565b5090565b60006103566103518461059a565b610575565b90508281526020810184848401111561037257610371610704565b5b61037d8482856105fc565b509392505050565b600082601f83011261039a576103996106ff565b5b81356103aa848260208601610343565b91505092915050565b6000813590506103c281610724565b92915050565b6000602082840312156103de576103dd61070e565b5b600082013567ffffffffffffffff8111156103fc576103fb610709565b5b61040884828501610385565b91505092915050565b600080604083850312156104285761042761070e565b5b600083013567ffffffffffffffff81111561044657610445610709565b5b61045285828601610385565b9250506020610463858286016103b3565b9150509250929050565b6000602082840312156104835761048261070e565b5b6000610491848285016103b3565b91505092915050565b60006104a5826105cb565b6104af81856105d6565b93506104bf81856020860161060b565b6104c881610713565b840191505092915050565b60006104de826105cb565b6104e881856105e7565b93506104f881856020860161060b565b80840191505092915050565b61050d816105f2565b82525050565b600061051f82846104d3565b915081905092915050565b600060208201905061053f6000830184610504565b92915050565b600060408201905061055a6000830185610504565b818103602083015261056c818461049a565b90509392505050565b600061057f610590565b905061058b8282610670565b919050565b6000604051905090565b600067ffffffffffffffff8211156105b5576105b46106d0565b5b6105be82610713565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b6000819050919050565b82818337600083830152505050565b60005b8381101561062957808201518184015260208101905061060e565b83811115610638576000848401525b50505050565b6000600282049050600182168061065657607f821691505b6020821081141561066a576106696106a1565b5b50919050565b61067982610713565b810181811067ffffffffffffffff82111715610698576106976106d0565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b61072d816105f2565b811461073857600080fd5b5056fea264697066735822122005f4761e428b272cff3be71d18d77c255fd57b725a8cec4f019c4e1beb4ada8164736f6c63430008070033",
    //data é o bin, copiamos o binary object do Simplestorage_sol_SimpleStorage.bin e adicionamos 0x no início e "". data é o diferenciador para o tipo de transação: deploy contrato, chamar função, transação etc.
    //ao adicionarmos aqui data duma função podemos chamar a função. Uma raw way de chamar uma função, que o ethers faz no backend quando estamos a chamar a função das maneiras que vemos a seguir p/ nao estarmos sempre a criar um transaction object destes gigante.
    chainId: 1337, //each evm chain has their own chain id, avalanche, polygon também têm as suas unique chain ids, as suas testnets também. fui buscar à ganache node info
  };

  const sentTxResponse = await wallet.sendTransaction(tx); //here we send the transaction. 'tx" are just the details
  await sentTxResponse.wait(1); //wait 1 block confirmation to make sure this transaction actually goes through
  console.log(sentTxResponse);

  */ //no entanto esta forma de enviar transaçoes/dar deploy ao contrato vai ficar commented out porque vamos usar a ethers easier to read way em cima para dar deploy ao contrato.
    //Esta é a raw way.

    //Vamos interagir com funções de contratos com ethersjs: (também podiamos interagir usando uma transação como em cima criando o object que é a raw way, aqui ethers faz isso no backend e interagimos de forma clean)
    const currentFavoriteNumber = await contract.retrieve()
    console.log(`Current Favorite Number: ${currentFavoriteNumber.toString()}`) //this returned "BigNumber { _hex: '0x00', _isBigNumber: true }", if it's without .toString(). Javascript has a hard time with decimal places, so we wanna use strings or 'BigNumber' when dealing with numbers. 1000000000000000 is too big of a number for js to understand, but "10000000000000" its ok.
    //We can make BigNumber more readable tho if we add .toString() and we print the string version of the BigNumber. Now it returned '0', which is what we wanted it to return.
    const transactionResponse = await contract.store("7") //we could add 7 without string cuz its a small number, but its a good practise to pass variables to contract functions using a string because if it was a massive number js would get confused.
    const transactionReceipt = await transactionResponse.wait(1) //mesma coisa que em cima mas com uma sintax ligeiramente diferente, when we call the transaction on the contract we get 'transaction response', when we wait for the transaction response
    //to finish, we get the transaction receipt. Mesma lógica. Vamos perceber no futuro porquê tanto foco na distinção de transaction response e transaction receipt.
    const updatedFavoriteNumber = await contract.retrieve()
    console.log(`Updated Favorite Number: ${updatedFavoriteNumber.toString()}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
