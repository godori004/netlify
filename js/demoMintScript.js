const revealUri = "https://gateway.pinata.cloud/ipfs/QmXZuDaHXpn7Enh6Kb3dxcmtUoXfxCfzCWPPLSmDQXSS8E"

let account;
let mintIndexForSale = 0;
let maxSaleAmount = 0;
let mintPrice = 0;
let mintStartBlockNumber = 0;
let mintLimitPerBlock = 0;

let blockNumber = 0;
let blockCnt = false;

let strMyNFTTokenId;

let state = 0;
let typed_header;
let typed_stirngs;

function cntBlockNumber() {
    if(!blockCnt) {
        setInterval(function(){
            blockNumber+=1;
            document.getElementById("blockNubmer").innerHTML = "현재 블록: #" + blockNumber;
        }, 1000);
        blockCnt = true;
    }
}

async function typedInit(){
    
    switch(state){
        case 1:
            setButton('MINT')
            typed_header = `<span>2. 민팅</span><br>`
            typed_string = `<span id="typed-strings"><span>NFT 발급</span><span>MINT 버튼을 눌러주세요</span><span>민팅 설명은 상단 링크 참조</span></span><span id='typed'></span>`
            break
        case 2:
            setButton('REVEAL')
            typed_header = `<span>3. 리빌</span><br>`
            typed_string = `<span id="typed-strings"><span>NFT 리빌</span><span>REVEAL 버튼을 눌러주세요</span><span>리빌 설명은 상단 링크 참조</span></span><span id='typed'></span>`
            break
        case 3:
            setButton('BURN')
            typed_header = `<span>4. BURN</span><br>`
            typed_string = `<span id="typed-strings"><span>NFT BURN</span><span>BURN 버튼을 눌러주세요</span><span>BURN 설명은 상단 링크 참조</span></span><span id='typed'></span>`
            break
    }

    let cell = document.getElementById("typed-header")
    while ( cell.hasChildNodes() ) { cell.removeChild( cell.firstChild ); }
    
    document.getElementById("typed-header").innerHTML = typed_header + typed_string
    //document.getElementById("typed-strings").innerHTML = typed_string
    type();
    //
}

async function connect() {
    const accounts = await klaytn.enable();
    if (klaytn.networkVersion === 8217) {
        alert('테스트넷 으로 접속해 주십시오.');
        return;
    } else if (klaytn.networkVersion === 1001) {
        console.log("테스트넷");
    } else {
        alert("ERROR: 클레이튼 네트워크로 연결되지 않았습니다!");
        return;
    }
    account = accounts[0];
    //alert("account : " + account)
    caver.klay.getBalance(account)
        .then(function (balance) {
            //document.getElementById("myWallet").innerHTML = `지갑주소: ${account}`
            //document.getElementById("myKlay").innerHTML = `잔액: ${caver.utils.fromPeb(balance, "KLAY")} KLAY`
        });
    console.log("account : " + account)
    console.log("CONTRACTADDRESS : " + CONTRACTADDRESS)
    //await check_status();

    if(state<1)state = 1

    await typedInit()
}

async function check_status() {
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    await myContract.methods.mintingInformation().call()
        .then(function (result) {
            console.log(result);
            mintIndexForSale = parseInt(result[1]);
            mintLimitPerBlock = parseInt(result[2]);
            mintStartBlockNumber = parseInt(result[4]);
            maxSaleAmount = parseInt(result[5]);
            mintPrice = parseInt(result[6]);
            document.getElementById("mintCnt").innerHTML = `${mintIndexForSale - 1} / ${maxSaleAmount}`;
            document.getElementById("mintLimitPerBlock").innerHTML = `트랜잭션당 최대 수량: ${mintLimitPerBlock}개`;
            document.getElementById('amount').max = mintLimitPerBlock;
            document.getElementById("mintStartBlockNumber").innerHTML = `민팅 시작 블록: #${mintStartBlockNumber}`;
            document.getElementById("mintPrice").innerHTML = `민팅 가격: ${caver.utils.fromPeb(mintPrice, "KLAY")} KLAY`;
        })
        .catch(function (error) {
            console.log(error);
        });
    blockNumber = await caver.klay.getBlockNumber();
    document.getElementById("blockNubmer").innerHTML = "현재 블록: #" + blockNumber;
    cntBlockNumber();
}

async function balanceOf(){

    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    let value;

    console.log("account : " + account)
    try{
        value      =  await myContract.methods.balanceOf(account).call();
        console.log(value)
    }catch(e){
        console.error(e)
    }   
    return value
}

// async function balanceOf(){
//     const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
//     let value;
//     console.log("account : " + account)
//     try{
//         value      =  await myContract.methods.sender().call();
//         console.log(value)
//     }catch(e){
//         console.error(e)
//     }   
//     return value
// }

async function tokenURI(){
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    let uri
    let strMyNFTTokenId
    let value 
    
    console.log("account : " + account)
    try{
        strMyNFTTokenId = await myNFTtokenId()
        value     = await myContract.methods.tokenURI(strMyNFTTokenId).call()
        console.log("tokenURI : " + value)
        
    }catch(e){
        console.error(e)
    }

    return value    
}

async function myNFTtokenId(){
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    console.log("account : " + account)
    try{
        const value      =  await myContract.methods.myNFTtokenId().call();
        strMyNFTTokenId = value[0]
        console.log("strMyNFTTokenId : " + strMyNFTTokenId)
    }catch(e){
        console.error(e)
    }  
    return strMyNFTTokenId
}

async function mintNFT(){

    let cnt         = 0
    let amount      = 1
    let mintPrice   = 1000000000000000000

    cnt = await balanceOf()
    const uri = "https://gateway.pinata.cloud/ipfs/QmdLCoKbTywRYhn4E2MqHAS85dd6B7zgAHUczZkAtPFVc7"
    //alert("mint cnt : " + cnt)
    if(cnt > 0){
        openNav()
        errorMessage("이미 민팅을 진행 하셨습니다.")
        state++
        typedInit()
        return
    }
    console.log('1')
    const total_value = BigNumber(amount * mintPrice);
    console.log('2')
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    console.log("account : " + account)

    /*const value      =  await myContract.methods.mintNFT(uri).estimateGas({
        from: account,
        gas: 6000000,
        value: caver.utils.toPeb(1, 'KLAY')
    })
    .then(function (gasAmount) {
        console.log("test")
        estmated_gas = gasAmount;
        console.log("gas :" + estmated_gas);
        myContract.methods.mintNFT(uri)
            .send({
                from: account,
                gas: estmated_gas,
                value: caver.utils.toPeb(1, 'KLAY')
            })
    })
    .catch(function (error) {
        console.log(error);
        alert("민팅에 실패하였습니다.");
    });*/

    await myContract.methods.mintNFT(uri)
        .estimateGas({
            from: account,
            gas: 6000000,
            value: total_value
        })
        .then(function (gasAmount) {
            estmated_gas = gasAmount;
            console.log("gas :" + estmated_gas);
            myContract.methods.mintNFT(uri)
                .send({
                    from: account,
                    gas: estmated_gas,
                    value: total_value
                })
        })
        .catch(function (error) {
            console.log(error);
            alert("민팅에 실패하였습니다.");
        });

    openNav()
    exScreen()
    console.log(value)
}

const reveal = async () =>{
    
    let tokenId = 0
    let tokenUri

    tokenId     = await myNFTtokenId()
    tokenUri    = await tokenURI()

    console.log(tokenId)
    console.log(tokenUri)

    if(revealUri==tokenUri){
        openNav()
        errorMessage("이미 리빌을 진행 하셨습니다.")
        state++
        typedInit()
        return
    }

    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);

    const value      =  await myContract.methods.changeTokenURI(tokenId, revealUri).estimateGas({
        from: account,
        gas: 6000000
    })
    .then(function (gasAmount) {
        estmated_gas = gasAmount;
        console.log("gas :" + estmated_gas);
        myContract.methods.changeTokenURI(tokenId, revealUri)
            .send({
                from: account,
                gas: estmated_gas
            })
    })
    .catch(function (error) {
        console.log(error);
        alert("리빌에 실패하였습니다.");
    });

    //openNav()
    //exScreen()

    console.log(value)
}

const burn = async () =>{

    tokenId     = await myNFTtokenId()

    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);

    const value      =  await myContract.methods.burn(tokenId).estimateGas({
        from: account,
        gas: 6000000
    })
    .then(function (gasAmount) {
        estmated_gas = gasAmount;
        console.log("gas :" + estmated_gas);
        myContract.methods.burn(tokenId)
            .send({
                from: account,
                gas: estmated_gas
            })
    })
    .catch(function (error) {
        console.log(error);
        alert("소각에 실패하였습니다.");
    });

    errorMessage("성공적으로 데모를 완료 하셨습니다. 감사합니다.")
}

const errorMessage = (message) =>{
    console.log(message)
    document.getElementById(`message-string`).innerText = message
    document.getElementById(`message-string`).style.display = "block"
    document.getElementById(`ex-screen`).style.display = "none"
}

const exScreen = () =>{
    document.getElementById(`message-string`).style.display = "none"
    document.getElementById(`ex-screen`).style.display = "block"
}

const setButton = (name) =>{

    let obj = document.getElementById("b_button")

    obj.style.display = 'block'
    obj.dataset.text = name

    switch(state){
        case 1:
            obj.setAttribute("onClick", "mintNFT()")
            break
        case 2:
            obj.setAttribute("onClick", "reveal()")
            break
        case 3:
            obj.setAttribute("onClick", "burn()")
            break
    }
}