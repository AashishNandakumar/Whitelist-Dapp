"use client";
import styles from "./page.module.css";
import Head from "next/head";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "./constants/index";

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
            <h4>An amazing NFT collection for developers in Crypto.</h4>
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
      <footer className={styles.footer}>Made with &#10084; by Ash devs</footer>
    </div>
  );
}
