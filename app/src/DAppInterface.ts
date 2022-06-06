import AssetsLoader from "./webgl/loader/AssetsLoader";
import IAsset from "./webgl/loader/IAsset";
import TextLoader from "./webgl/loader/TextLoader";

import BN = require("bn.js");
import Web3 = require("web3");
import Contract from "web3/eth/contract";

// const TruffleContract = require("truffle-contract");
const BigNumber = require("bignumber.js");

/**
 * Created by mdavids on 10/07/2018.
 */
class DAppInterface {
  public static instance:DAppInterface;
  protected _web3:Web3;

  public IS_BETTING_LOCKED:boolean = true;

  public doneCallback:()=>void;
  public errorCallback:(err:any)=>void;
  public eventCallback:()=>void;

  public adminData:any = {};
  public playerData:any = {};
  public corpsData:any = {};
  public worldState:any = {};
  public raidsData:any = {};
  public buySellPrices:any = {};

  public nodeNames:string[] = [
    "Pales Eng",
    "Tokyo Chemicals",
    "Node 1",
    "Node 2",
    "Node 3",
    "Node 4",
    "Node 5",
    "Node 6",
    "Node 7",
    "Node 8",
    "Node 9",
    "Node 10",
    "Node 11",
    "Node 12",
  ];

  protected _web3Provider:any;

  protected _contract:Contract;
  protected _contractInstance:any;
  protected _accounts:any;
  protected _currentAccount:any;
  protected _ether:any;
  protected _magnitude:any;

  protected _assetsLoader:AssetsLoader = new AssetsLoader();

  protected _pendingRaidData:any[] = [];
  protected _currentRaidIndex:number = 0;

  protected _subscribedEvents:any = {};
  protected _pendingTransactions:string[] = [];

  constructor()
  {
    DAppInterface.instance = this;

    this._ether = new BigNumber('1e18');
    this._magnitude = (new BigNumber('2')).pow('64');
  }

  public init():void {
    if (typeof Web3.givenProvider !== 'undefined') {
      this._web3Provider = Web3.givenProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      this._web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    if (!this._web3Provider) {
      this.errorCallback('no web3 provider');
      return;
    }

    this._web3 = new Web3(this._web3Provider);

    if (this._web3Provider.hasOwnProperty('enable')) {
      this._web3Provider.enable().then((accounts:any) => {
        this.onAccountsExposed()
      }).catch((error:any) => {
        this.onAccountsExposed()
      })
    } else {
      this.onAccountsExposed()
    }
  }

  protected onAccountsExposed():void
  {
    // ----------------
    // loading contract
    // ----------------
    this._assetsLoader.doneCallback = ()=>this.onContractLoaded();
    this._assetsLoader.errorCallback = (asset:IAsset)=>this.onLoadingError(asset);
    this._assetsLoader.updateCallback = ()=>this.onLoadingUpdate();

    var textLoader:TextLoader;
    var scenesData:any[] = [
      { id:"contract_corpocracy", url:"data/contracts/Corpocracy.json" }
    ];

    for (let i:number = 0; i < scenesData.length; i++) {
      textLoader = new TextLoader(scenesData[i]["id"], scenesData[i]["url"]);
      this._assetsLoader.push(textLoader);
    }

    this._assetsLoader.loadAll();
  }

  public checkForAccountSwitch(callback:(didSwitch:boolean) => void):void
  {
    this._web3.eth.getAccounts((err:any, accounts:any) => {
      if (err) {
        // console.log(err);

      } else {
        const didSwitch:boolean = accounts[0] !== this._currentAccount;
        callback(didSwitch);
      }
    });
  }

  public refresh():void
  {
    // console.log("DAppInterface refresh");

    this._web3.eth.getAccounts((err:any, accounts:any) => this.onAccounts(err, accounts));
  }

  protected onContractLoaded():void
  {
    const ContractArtifact = JSON.parse((this._assetsLoader.getAsset("contract_corpocracy") as TextLoader).getText());
    // const deployedAddress = ContractArtifact.networks[this._web3Provider.networkVersion].address;
    const deployedAddress = "0xeaa32c92f757836263f854428da66ac23178d021";
    this._contract = new this._web3.eth.Contract(ContractArtifact.abi, deployedAddress);

    this.onContractReady(this._contract);


    // this._contract.deployed()
    //   .then((instance:any) => this.onContractReady(instance))
    //   .catch((err:any) => this.onContractError(err));
  }

  protected onContractReady(instance:any):void {
    this._contractInstance = instance;
    // console.log(this._contractInstance);

    this.onInitEventHandlers();
    this.refresh();
  }

  protected onAccounts(err:any, accounts:any):void
  {
    if (err) {
      // console.log(err);
    }

    this._accounts = accounts;

    if (!this._accounts) {
      this.errorCallback('no accounts');
      return;
    }

    if (this._accounts.length > 0) {
      this._currentAccount = this._accounts[0];
      this._contractInstance.methods.administrators(this._currentAccount).call()
        .then((data:any) => this.onAdmin(data))
        .catch((err:any) => this.onTransactionError(err));

    } else {
      this._currentAccount = null;
      this._contractInstance.methods.buyPrice(1).call()
        .then((data:any) => this.onBuyPrice(data))
        .catch((err:any) => this.onTransactionError(err));
    }
  }

  protected onAdmin(rawData:any):void
  {
    // console.log("administrators: " + rawData);

    const data:any = this.prepareInput(rawData);

    this.adminData = {};
    this.adminData["isAdmin"] = data;

    this._contractInstance.methods.adminBalance().call()
      .then((data:any) => this.onAdminBalance(data))
      .catch((err:any) => this.onTransactionError(err));
  }

  protected onAdminBalance(rawData:any):void
  {
    // console.log("onAdminBalance: " + rawData);

    const data:any = this.prepareInput(rawData);
    this.adminData["balance"] = data.div(this._ether);

    this._contractInstance.methods.getBuyPrice(1).call()
      .then((data:any) => this.onBuyPrice(data))
      .catch((err:any) => this.onTransactionError(err));
  }

  protected onBuyPrice(rawData:any):void
  {
    // console.log("buy price: " + rawData);

    const data:any = this.prepareInput(rawData);
    // const data:any = new BigNumber(rawData);
    this.buySellPrices["buyPrice"] = data.div(this._ether);

    this._contractInstance.methods.getSellPrice(1).call()
      .then((data:any) => this.onSellPrice(data))
      .catch((err:any) => this.onTransactionError(err));
  }

  protected onSellPrice(rawData:any):void
  {
    // console.log("sell price: " + rawData);

    const data:any = this.prepareInput(rawData);
    // const data:any = new BigNumber(rawData);
    this.buySellPrices["sellPrice"] = data.div(this._ether);

    if (this._accounts.length > 0) {
      const account = this._accounts[0];
      this._contractInstance.methods.getPlayerData(account).call()
        .then((data:any) => this.onUserData(data))
        .catch((err:any) => this.onTransactionError(err));

    } else {
      this.onEmptyUserData();
    }
  }

  protected onEmptyUserData():void
  {
    this.playerData = {};
    this.playerData["initialized"] = false;
    this.playerData["corpId"] = new BigNumber('1');
    this.playerData["tokenBalance"] = new BigNumber('0');
    this.playerData["dividends"] = new BigNumber('0');
    this.playerData["referralBalance"] = new BigNumber('0');
    this.playerData["raidIds"] = [new BigNumber('0'), new BigNumber('0'), new BigNumber('0'), new BigNumber('0')];
    this.playerData["raidStakes"] = [new BigNumber('0'), new BigNumber('0'), new BigNumber('0'), new BigNumber('0')];
    this.playerData["totalEtherSpent"] = new BigNumber('0');

    this.adminData = {};
    this.adminData["isAdmin"] = false;
    this.adminData["balance"] = new BigNumber('0');

    this._contractInstance.methods.corporations(0).call()
      .then((data:any) => this.onCorpData(data))
      .catch((err:any) => this.onTransactionError(err));
  }

  protected onUserData(rawData:any):void
  {
    // console.log("user data: " + rawData);

    const data:any = this.prepareInput(rawData);

    this.playerData = {};
    this.playerData["initialized"] = data[0];
    this.playerData["corpId"] = data[0]? data[1] : new BigNumber('1');
    this.playerData["tokenBalance"] = data[2].div(this._ether);
    this.playerData["dividends"] = data[3].div(this._ether);
    this.playerData["referralBalance"] = data[4].div(this._ether);
    this.playerData["raidIds"] = data[5];
    this.playerData["raidStakes"] = data[6];
    this.playerData["totalEtherSpent"] = data[7].div(this._ether);

    const raidStakes:any = this.playerData["raidStakes"];
    for (let i:number = 0; i < raidStakes.length; i++) {
      raidStakes[i] = new BigNumber(raidStakes[i].toString()).div(this._ether);
    }

    // console.log("raidIds", this.playerData["raidIds"]);
    // console.log("raidStakes", this.playerData["raidStakes"]);

    this._pendingRaidData = [];
    this._currentRaidIndex = 0;

    const raidIds:any[] = this.playerData["raidIds"];
    for (let i:number = 0; i < raidIds.length; i++) {
      const raidId:string = raidIds[i].toString();
      if (this._pendingRaidData.indexOf(raidId) < 0) {
        this._pendingRaidData.push(raidId);
      }
    }

    this._contractInstance.methods.corporations(0).call()
      .then((data:any) => this.onCorpData(data))
      .catch((err:any) => this.onTransactionError(err));
  }

  protected onCorpData(rawData:any):void
  {
    // console.log("corp data: " + rawData);

    const data:any = this.prepareInput(rawData);

    const corp:any = {};
    corp["id"] = data[0];
    corp["mainNodeId"] = data[1];
    corp["totalValue"] = data[2];
    corp["profitsPerShare"] = data[3].div(this._magnitude);
    corp["tokenSupply"] = data[4].div(this._ether);
    corp["name"] = corp["id"].eq(0)? "Pales Engineering" : "Tokyo Chemicals";

    if (corp["id"].eq(0)) {
      corp["desc"] = [
        "$An American electrical engineering and software company that provides",
        "$automation products and services such as robotics and computer control",
        "$systems."
      ];
    } else {
      corp["desc"] = [
        "$A Japanese manufacturer of chemicals, fibers and other materials. Its",
        "$main business areas are functional chemicals, pharmaceuticals, safety",
        "$systems and agrochemicals."
      ];
    }

    this.corpsData[corp["id"].toFixed()] = corp;

    if (corp["id"].eq(0)) {
      this._contractInstance.methods.corporations(1).call()
        .then((data:any) => this.onCorpData(data))
        .catch((err:any) => this.onTransactionError(err));

    } else {
      this._contractInstance.methods.getWorldState().call()
        .then((data:any) => this.onWorldState(data))
        .catch((err:any) => this.onTransactionError(err));
    }
  }

  protected onWorldState(rawData:any):void
  {
    // console.log("world state: " + rawData);
    // console.log("contract addr: " + this._contractInstance.address);

    const data:any = this.prepareInput(rawData);

    this.worldState = {};
    this.worldState["isPrerelease"] = data[0];
    this.worldState["nodeOwners"] = data[1];
    this.worldState["pendingRaidIds"] = data[2];

    this.IS_BETTING_LOCKED = this.worldState["isPrerelease"];

    const raidIds:any[] = this.worldState["pendingRaidIds"];
    for (let i:number = 0; i < raidIds.length; i++) {
      const raidId:string = raidIds[i].toString();
      if (this._pendingRaidData.indexOf(raidId) < 0) {
        this._pendingRaidData.push(raidId);
      }
    }

    this.onLoadNextRaid();
  }

  protected onLoadNextRaid(rawData:any = null):void
  {
    // console.log("onLoadNextRaid: " + this._currentRaidIndex);

    if (rawData) {
      const data:any = this.prepareInput(rawData);
      const raid:any = {};
      raid["id"] = data[0];
      raid["targetNodeId"] = data[1];
      raid["attackingCorpId"] = data[2];
      raid["wasSuccessful"] = data[3];
      raid["hasBeenRevealed"] = data[4];
      raid["defenderStakes"] = data[5].div(this._ether);
      raid["attackerStakes"] = data[6].div(this._ether);
      raid["blocksLeft"] = data[7];
      raid["timeLeft"] = raid["blocksLeft"].times("15");
      raid["hasEnded"] = raid["timeLeft"].eq("0");

      this.raidsData[raid["id"].toString()] = raid;
    }

    if (this._currentRaidIndex >= this._pendingRaidData.length) {
      this.refreshPending();
      this.doneCallback();
      return;
    }

    const raidId:string = this._pendingRaidData[this._currentRaidIndex];
    this._currentRaidIndex++;

    this._contractInstance.methods.getRaidState(Number(raidId)).call()
      .then((data:any) => this.onLoadNextRaid(data))
      .catch((err:any) => this.onTransactionError(err));
  }

  protected onInitEventHandlers():void
  {
    const onTokenPurchase = this._contractInstance.events.onTokenPurchase;
    const onTokenSell = this._contractInstance.events.onTokenSell;
    const onWithdraw = this._contractInstance.events.onWithdraw;
    const onTransfer = this._contractInstance.events.onTransfer;
    const onWorldNodeRaid = this._contractInstance.events.onWorldNodeRaid;
    const onWorldNodeOwnerReveal = this._contractInstance.events.onWorldNodeOwnerReveal;
    const onClaimedTokens = this._contractInstance.events.onClaimedTokens;

    onTokenPurchase({}, (error, result) => this.handleContractEvent(error, result));
    onTokenSell({}, (error, result) => this.handleContractEvent(error, result));
    onWithdraw({}, (error, result) => this.handleContractEvent(error, result));
    onTransfer({}, (error, result) => this.handleContractEvent(error, result));
    onWorldNodeRaid({}, (error, result) => this.handleContractEvent(error, result));
    onWorldNodeOwnerReveal({}, (error, result) => this.handleContractEvent(error, result));
    onClaimedTokens({}, (error, result) => this.handleContractEvent(error, result));
  }

  protected handleContractEvent(error, result):void
  {
    if (!error) {
      this.eventCallback();

    } else {
      // console.log(error);
    }
  }

  protected onContractError(err:any):void
  {
    // console.log(err.message);

    this.errorCallback(err);
  }

  protected onTransactionError(err:any):void
  {
    // console.log('onTransactionError');
    // console.log(err.message);
    // console.log(err);
  }

  protected onLoadingError(asset:IAsset):void
  {
    // console.log(asset);

    this.errorCallback("Asset could not be loaded");
  }

  protected onLoadingUpdate():void
  {

  }

  public hasPendingTransactions():boolean
  {
    return this._pendingTransactions.length > 0;
  }

  // Contract calls
  public buyTokens(
    ether:any,
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];
    const referredByAdd = "0x0000000000000000000000000000000000000000";

    this._contractInstance.methods.buy(referredByAdd).estimateGas({
      from:account,
      value:this._web3.utils.toWei(ether.toFixed(), "ether"),
    }).then((data:any) => {
        let estimatedGas = new BigNumber(data.toString());
        estimatedGas = estimatedGas.times(new BigNumber("1.2")).decimalPlaces(0);
        // console.log(estimatedGas.toFixed());

        return this._contractInstance.methods.buy(referredByAdd).send({
          from:account,
          value:this._web3.utils.toWei(ether.toFixed(), "ether"),
          gas:estimatedGas.toFixed()
        })
          .on('transactionHash', (hash:string) => {
            // console.log(hash);
            this.registerPending(hash);
            onHash(hash);
          })
          .on('receipt', (receipt:any) => {
            // console.log(receipt);
            onReceipt(receipt);
          })
          .on('error', (error:any, receipt:any) => {
            // console.log(error, receipt);
            onError(error);
          });
      });
  }

  public sellTokens(
    amount:any,
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];
    const strAmount:string = amount.toFixed();

    // console.log(strAmount);

    this._contractInstance.methods.sell(strAmount).estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("2")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.sell(strAmount).send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public raidWorldNode(
    nodeId:number,
    stakes:string,
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];

    this._contractInstance.methods.raidWorldNode(nodeId, stakes).estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("1.5")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.raidWorldNode(nodeId, stakes).send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public defendWorldNode(
    nodeId:number,
    stakes:string,
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];

    this._contractInstance.methods.defendWorldNode(nodeId, stakes).estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("1.5")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.defendWorldNode(nodeId, stakes).send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public revealPendingRaid(
    nodeId:number,
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];

    this._contractInstance.methods.revealWorldNodeOwnership(nodeId).estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("1.5")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.revealWorldNodeOwnership(nodeId).send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public claimTokens(
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];

    this._contractInstance.methods.claimRaidTokens().estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("2")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.claimRaidTokens().send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public withdrawEther(
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];

    this._contractInstance.methods.withdraw().estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("1.2")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.withdraw().send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public withdrawAdminBalance(
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];

    this._contractInstance.methods.withdrawAdminBalance().estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("1.2")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.withdrawAdminBalance().send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public changePlayerCorporation(
    toCorpID:number,
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];

    this._contractInstance.methods.changePlayerCorporation(toCorpID).estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("1.2")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.changePlayerCorporation(toCorpID).send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  public transfer(
    toPlayerID:string,
    tokenAmount:any,
    onHash:(hash:string) => void,
    onReceipt:(receipt:any) => void,
    onError:(error:any) => void
  ):void
  {
    const account = this._accounts[0];
    const tmpTokenAmount = tokenAmount.toFixed(0);

    this._contractInstance.methods.transfer(toPlayerID, tmpTokenAmount).estimateGas({
      from:account
    }).then((data:any) => {
      let estimatedGas = new BigNumber(data.toString());
      estimatedGas = estimatedGas.times(new BigNumber("1.2")).decimalPlaces(0);
      // console.log(estimatedGas.toFixed());

      return this._contractInstance.methods.transfer(toPlayerID, tmpTokenAmount).send({
        from:account,
        gas:estimatedGas.toFixed()
      })
        .on('transactionHash', (hash:string) => {
          // console.log(hash);
          this.registerPending(hash);
          onHash(hash);
        })
        .on('receipt', (receipt:any) => {
          // console.log(receipt);
          onReceipt(receipt);
        })
        .on('error', (error:any, receipt:any) => {
          // console.log(error, receipt);
          onError(error);
        });
    });
  }

  destruct()
  {

  }

  private registerPending(hash:string):void
  {
    this._pendingTransactions.push(hash);
  }

  private refreshPending():void
  {
    const pending:Promise<any>[] = [];
    for (let hash of this._pendingTransactions) {
      pending.push(this._web3.eth.getTransaction(hash));
    }

    Promise.all(pending).then((values:any) => {
      for (let receipt of values) {
        if (receipt && receipt.blockNumber) {
          const index:number = this._pendingTransactions.indexOf(receipt.hash);
          if (index >= 0) {
            this._pendingTransactions.splice(index, 1);
          }
        }
      }
    }).catch((error:any) => {
      // console.log(error);
    });
  }

  private prepareInput(data:any):any
  {
    // console.log(data.constructor.name);
    if (typeof data === 'boolean') {
      return data;
    }

    if (Array.isArray(data)) {
      const result:any[] = [];
      for (let i:number = 0; i < data.length; i++) {
        result.push(this.prepareInput(data[i]));
      }

      return result;
    }

    if (typeof data === 'object' && data.constructor === Object) {
      const result:any = {};
      for (let key in data) {
        // console.log(key, data[key], data[key].constructor.name);
        if (data.hasOwnProperty(key)) {
          result[key] = this.prepareInput(data[key]);
        }
      }

      return result;
    }

    return new BigNumber(data.toString());

    // if (this._web3.utils.isBN(data)
    //   || data.constructor.name === 'BigNumber'
    //   || (typeof data === 'number' && isFinite(data))) {
    //   return new BigNumber(data.toString());
    // }

    // return data;
  }

}
export default DAppInterface;
