"use client";
import styles from "./page.module.css";
import Head from "next/head";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "./constants/page.js";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  const [loading, setLoading] = useState(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  // create a reference to Web3 Modal used for connecting to metamask
  const web3ModalRef = useRef(null);

  const getProviderOrSigner = async (needSigner = false) => {
    // Connecting to metamask
    // since it is a reference obtain the current value of it
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      // making sure the user is connected to goerli network
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 11155111) {
        window.alert("Change the network to Sepolia");
        throw new Error("Change network to goerli");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        // this returns a signer
        return signer;
      }

      // this returns a provider
      return web3Provider;
    } catch (err) {
      console.error(err);
    }
  };

  // Add the connected Address into Whitelist:
  const addAddressToWhitelist = async () => {
    try {
      // since this is a write transaction we require a signer
      const signer = await getProviderOrSigner(true);
      // creating an instance of the contract:
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Accessing the functions of the contract from the above instance:
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);

      // Wait for the above tx to me mined:
      await tx.wait();
      setLoading(false);

      // Get the updated no of addresses from the whitelist:
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Getting the no of whitelisted address:
  const getNumberOfWhitelisted = async () => {
    try {
      // get the provider for web3modal(metamask):
      const provider = await getProviderOrSigner();

      // creating an instance of our contract but this time it is read only:
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      // calling the fxn of our contract
      const _numberOfWhitelisted =
        await whitelistContract.numAddressWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  // check if an address is in whitelist:
  const checkIfAddressInWhitelist = async () => {
    try {
      // fetch the signer:
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      // obtain the owner's address:
      const address = await signer.getAddress();

      // check if this address is in whitelist:
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );

      // toggle accordingly:
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  // Connect the metamask to our dApp(This is the first step):
  const connectWallet = async () => {
    try {
      // get the provider from web3modal:
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  // Rendering a button based on the state of the dApp:
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your Wallet
        </button>
      );
    }
  };

  // useEffects will react to change of state of website
  useEffect(() => {
    // check for wallet connection:
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 11155111,
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        {/* Adding metadata and links to a webpage: */}
        {/* this tells the search engine what the webpage is about */}
        <meta name="description" content="Whitelist-Dapp" />
        {/* This tells the browser to use this icon(favicon) that is displayed next to web page's title in browsers address bar */}
        <link rel="icon" href="/favicon.io" />
      </Head>
      {/* Any styling applied for class main will be applies to this div */}
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs</h1>
          <div className={styles.desription}>
            {/* An HTML entity is a character represented by a special code, here an apostrophe */}
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {/* If u want to include JS in HTML enclose them within "{}" */}
            {numberOfWhitelisted} have already joined the Whitelist!
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by crypto devs
      </footer>
    </div>
  );
}

// "use client";
// import Head from "next/head";
// import styles from "./page.module.css";
// import Web3Modal from "web3modal";
// import { providers, Contract } from "ethers";
// import { useEffect, useRef, useState } from "react";
// import { WHITELIST_CONTRACT_ADDRESS, abi } from "./constants/page";

// export default function Home() {
//   // walletConnected keep track of whether the user's wallet is connected or not
//   const [walletConnected, setWalletConnected] = useState(false);
//   // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
//   const [joinedWhitelist, setJoinedWhitelist] = useState(false);
//   // loading is set to true when we are waiting for a transaction to get mined
//   const [loading, setLoading] = useState(false);
//   // numberOfWhitelisted tracks the number of addresses's whitelisted
//   const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
//   // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
//   const web3ModalRef = useRef();

//   /**
//    * Returns a Provider or Signer object representing the Ethereum RPC with or without the
//    * signing capabilities of metamask attached
//    *
//    * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
//    *
//    * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
//    * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
//    * request signatures from the user using Signer functions.
//    *
//    * @param {*} needSigner - True if you need the signer, default false otherwise
//    */
//   const getProviderOrSigner = async (needSigner = false) => {
//     // Connect to Metamask
//     // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
//     const provider = await web3ModalRef.current.connect();
//     const web3Provider = new providers.Web3Provider(provider);

//     // If user is not connected to the Goerli network, let them know and throw an error
//     const { chainId } = await web3Provider.getNetwork();
//     if (chainId !== 5) {
//       window.alert("Change the network to Goerli");
//       throw new Error("Change network to Goerli");
//     }

//     if (needSigner) {
//       const signer = web3Provider.getSigner();
//       return signer;
//     }
//     return web3Provider;
//   };

//   /**
//    * addAddressToWhitelist: Adds the current connected address to the whitelist
//    */
//   const addAddressToWhitelist = async () => {
//     try {
//       // We need a Signer here since this is a 'write' transaction.
//       const signer = await getProviderOrSigner(true);
//       // Create a new instance of the Contract with a Signer, which allows
//       // update methods
//       const whitelistContract = new Contract(
//         WHITELIST_CONTRACT_ADDRESS,
//         abi,
//         signer
//       );
//       // call the addAddressToWhitelist from the contract
//       const tx = await whitelistContract.addAddressToWhitelist();
//       setLoading(true);
//       // wait for the transaction to get mined
//       await tx.wait();
//       setLoading(false);
//       // get the updated number of addresses in the whitelist
//       await getNumberOfWhitelisted();
//       setJoinedWhitelist(true);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /**
//    * getNumberOfWhitelisted:  gets the number of whitelisted addresses
//    */
//   const getNumberOfWhitelisted = async () => {
//     try {
//       // Get the provider from web3Modal, which in our case is MetaMask
//       // No need for the Signer here, as we are only reading state from the blockchain
//       const provider = await getProviderOrSigner();
//       // We connect to the Contract using a Provider, so we will only
//       // have read-only access to the Contract
//       const whitelistContract = new Contract(
//         WHITELIST_CONTRACT_ADDRESS,
//         abi,
//         provider
//       );
//       // call the numAddressesWhitelisted from the contract
//       const _numberOfWhitelisted =
//         await whitelistContract.numAddressesWhitelisted();
//       setNumberOfWhitelisted(_numberOfWhitelisted);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /**
//    * checkIfAddressInWhitelist: Checks if the address is in whitelist
//    */
//   const checkIfAddressInWhitelist = async () => {
//     try {
//       // We will need the signer later to get the user's address
//       // Even though it is a read transaction, since Signers are just special kinds of Providers,
//       // We can use it in it's place
//       const signer = await getProviderOrSigner(true);
//       const whitelistContract = new Contract(
//         WHITELIST_CONTRACT_ADDRESS,
//         abi,
//         signer
//       );
//       // Get the address associated to the signer which is connected to  MetaMask
//       const address = await signer.getAddress();
//       // call the whitelistedAddresses from the contract
//       const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
//         address
//       );
//       setJoinedWhitelist(_joinedWhitelist);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /*
//     connectWallet: Connects the MetaMask wallet
//   */
//   const connectWallet = async () => {
//     try {
//       // Get the provider from web3Modal, which in our case is MetaMask
//       // When used for the first time, it prompts the user to connect their wallet
//       await getProviderOrSigner();
//       setWalletConnected(true);

//       checkIfAddressInWhitelist();
//       getNumberOfWhitelisted();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /*
//     renderButton: Returns a button based on the state of the dapp
//   */
//   const renderButton = () => {
//     if (walletConnected) {
//       if (joinedWhitelist) {
//         return (
//           <div className={styles.description}>
//             Thanks for joining the Whitelist!
//           </div>
//         );
//       } else if (loading) {
//         return <button className={styles.button}>Loading...</button>;
//       } else {
//         return (
//           <button onClick={addAddressToWhitelist} className={styles.button}>
//             Join the Whitelist
//           </button>
//         );
//       }
//     } else {
//       return (
//         <button onClick={connectWallet} className={styles.button}>
//           Connect your wallet
//         </button>
//       );
//     }
//   };

//   // useEffects are used to react to changes in state of the website
//   // The array at the end of function call represents what state changes will trigger this effect
//   // In this case, whenever the value of `walletConnected` changes - this effect will be called
//   useEffect(() => {
//     // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
//     if (!walletConnected) {
//       // Assign the Web3Modal class to the reference object by setting it's `current` value
//       // The `current` value is persisted throughout as long as this page is open
//       web3ModalRef.current = new Web3Modal({
//         network: "goerli",
//         providerOptions: {},
//         disableInjectedProvider: false,
//       });
//       connectWallet();
//     }
//   }, [walletConnected]);

//   return (
//     <div>
//       <Head>
//         <title>Whitelist Dapp</title>
//         <meta name="description" content="Whitelist-Dapp" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <div className={styles.main}>
//         <div>
//           <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
//           <div className={styles.description}>
//             {/* Using HTML Entities for the apostrophe */}
//             It&#39;s an NFT collection for developers in Crypto.
//           </div>
//           <div className={styles.description}>
//             {numberOfWhitelisted} have already joined the Whitelist
//           </div>
//           {renderButton()}
//         </div>
//         <div>
//           <img className={styles.image} src="./crypto-devs.svg" />
//         </div>
//       </div>

//       <footer className={styles.footer}>
//         Made with &#10084; by Crypto Devs
//       </footer>
//     </div>
//   );
// }
