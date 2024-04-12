import { useEffect, useRef, useState } from "react";
import logo from "@assets/img/logo.svg";
import loader from "@assets/img/loading.gif";
import mango from "@assets/img/mango.png";
import zara from "@assets/img/zara.png";
import asos from "@assets/img/asos.png";
import googleSigninButton from "@assets/img/google-signin-button.png";
import houseOfCb from "@assets/img/house_of_cb.png";
import { OAUTH } from "../../../utils/oauth";
import { ExtensionMessage, requestBackground, storageGet, storageSet } from "../../../utils/misc";
import { config } from "../../../utils/config";
import { Product } from "../../../utils/calculateSize";

import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStateWithCallback } from "../../../utils/use-state-with-callback";

const screens = ['signIn', 'firstTimeUser', 'loadingEmails', 'startShopping'] as const;
type Screen = typeof screens[number];
export default function Popup(): JSX.Element {
  const [screen, setScreen] = useState<Screen>();
  const [name, setName] = useState<string>();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);
  const [productsFound, setProductsFound] = useStateWithCallback<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [messagesProcessed, setMessagesProcessed] = useState<number>(0);

  const calledOnce = useRef(false);

  const listeners = async (request, sender, sendResponse) => {
    let div;
    let body;
    let itemsIndex;
    let orderIndex;
    let startIndex;

    switch (request.context) {
      case config.keys.productsSaved:
        setProductsFound(request.data.data);
        break;
      case 'getTotalMessages':
        setTotalMessages(request.data.data);
        break;
      case 'getMessagesProcessed':
        setMessagesProcessed(request.data.data);
        break;
      case 'getTextContentHelper':
        body = request.payload;
        div = document.createElement('div');
        div.innerHTML = body;
        sendResponse(div.textContent);
        break;
      case 'createDivForAsos':
        body = request.payload;
        div = document.createElement('div');
        div.innerHTML = body;
        itemsIndex = div.textContent.lastIndexOf('Items');
        orderIndex = div.textContent.lastIndexOf('Your order');
        if (itemsIndex > -1) {
          startIndex = itemsIndex + 5;
        }
        if (orderIndex > -1) {
          startIndex = orderIndex + 10;
        }
        sendResponse(
          div.textContent
            .substring(startIndex, body.lastIndexOf('Total'))
            .split(/[ \t]{2,}/)
        );
        break;
      default:
        console.log('$%^& we missed this one', request.context);
        break;
    }
  }

  useEffect(() => {
    if (calledOnce.current) {
      return;
    }

    requestBackground(
      new ExtensionMessage(config.keys.getProfileInfo)
    ).then(async (profileInfo) => {
      console.log(profileInfo);
      setName(profileInfo.given_name);
      await storageSet(config.keys.user, profileInfo);
      await storageSet(
        config.keys.googleUserId,
        profileInfo.id
      );
      console.log('should have email, given name and ID now');
    })
    storageGet(OAUTH.user.info)
      .then((user) => {
        if (user) {
          storageGet<Product[]>(config.keys.products)
            .then((products) => {
              console.log('products:', products)
              if (products && products.length > 0) {
                setIsFirstTimeUser(false);
                setScreen('startShopping');
              } else {
                setScreen('firstTimeUser');
              }
            })
        } else {
          setScreen('signIn');
        }
      })
      .catch(() => {
        setScreen('signIn');
      })

    chrome.runtime.onMessage.addListener(listeners);

    calledOnce.current = true;

    return () => {
      chrome.runtime.onMessage.removeListener(listeners);
    }
  }, []);

  useEffect(() => {
    if (screen === 'loadingEmails') {
      requestBackground(
        new ExtensionMessage(config.keys.loadMessages)
      ).then((): void => {
        setProductsFound(0, (prev) => {
          toast(`${prev} products found`);
        });
        setMessagesProcessed(0);
        setTotalMessages(0);
        setScreen('startShopping')
      })
    }
  }, [screen]);

  const handleLogin = async () => {
    await OAUTH.user.signIn();
    if (isFirstTimeUser) {
      setScreen('firstTimeUser');
    } else {
      setScreen('returningUser');
    }
  }

  const handleLogout = async () => {
    await OAUTH.user.logOut();
    setScreen('signIn');
  }

  const handleLoadEmails = async () => {
    setScreen('loadingEmails');
  }

  const Footer = () => {
    return (
      <div className="h-[90px] py-7 px-8 flex items-center border-t-2 justify-between">
        <a className="py-3 px-[30px] border-2 text-[#712E49] border-[#712E49] rounded-lg text-[14px]" href="https://www.efitterapp.com/how-it-works"
          target="_blank" rel="noreferrer">How it works</a>
        <button className="text-[#712E49] underline text-[14px]" onClick={handleLogout}>Log out</button>
      </div>
    )
  }

  const SignIn = () => (
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[70px] mb-0"
          alt="logo"
        />
        <h1 className="mt-[32px] text-[85px]">Hello!</h1>
        <p className="text-[15px]">Let&#39;s get started</p>
        <button onClick={handleLogin}>
          <img
            className="mt-[50px] mb-[50px] w-[187px] h-[44px]"
            src={googleSigninButton}
          />
        </button>
        <p className="">Now available at</p>
        <div className="flex items-center my-[30px] gap-8">
          <img className="w-[85px] h-[14px]" src={mango} />
          <img className="w-[49px] h-[19px]" src={zara} />
          <img className="w-[97px] h-[27px]" src={houseOfCb} />
        </div>
        <a className="text-[#712E49] underline" href="https://www.efitter.com/brand-directory">Browse our brand directory</a>
      </header>
    </>)

  const FirstTimeUser = () => (
    <div className="flex flex-col justify-between h-full">
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[59px] mb-0"
          alt="logo"
        />
        <h1 className="mt-[56px] text-[56px]">Hey {name}</h1>
        <p className="text-[15px] my-[39px]">efitter uses your past orders to predict your size.<br />
          To get started, click “Load your emails”</p>
        <button className="py-3 px-10 text-[#712E49] bg-[#FFD9E3] rounded-lg" onClick={handleLoadEmails}>Load your email</button>
      </header>
      <Footer />
    </div>
  )

  const LoadingEmails = () => {
    return (
      <div className="flex flex-col justify-between h-full">
        <header className="flex flex-col items-center justify-center text-black">
          <img
            src={logo}
            className="h-[56px] pointer-events-none mt-[59px] mb-0"
            alt="logo"
          />
          <h1 className="mt-[50px] text-[56px] leading-none">We&apos;re loading<br />your emails</h1>
          <p className="text-[15px] mt-10">Please give us a sec, searching for items...</p>
          {!!totalMessages && (
            <>
              <div className="w-[272px] h-[10px] bg-[#E9E9E9] rounded-full mt-10">
                <div style={{ width: `${(messagesProcessed / totalMessages) * 100}%` }} className="h-full bg-[#712E49] rounded-full"></div>
              </div>
              <p className="text-[12px] text-[#712E49] mt-3">{`${Math.floor((messagesProcessed / totalMessages) * 100)}%`} completed</p>
              <p className="text-[12px] text-[#712E49]">{productsFound} products found</p></>
          )}
        </header>
        <Footer />
      </div>
    )
  }

  const StartShopping = () => (
    <div className="flex flex-col justify-between h-full">
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[59px] mb-0"
          alt="logo"
        />
        <h1 className="my-[39px] text-[56px]">Shop with efitter</h1>
        <p className="text-[15px]">We have found your recent order confirmations.<br />Start shopping with efitter at your favourite brands!</p>
        <div className="flex items-center justify-center gap-4">
          <a href="https://www.efitterapp.com/brand-directory"
            className="mt-[28px] py-2 px-6 text-[#712E49] bg-[#FFD9E3] rounded-lg"
            target="_blank" rel="noreferrer">Browse our brand directory</a>
          <button className="mt-[28px] py-2 px-8 border-2 border-[#712E49] text-[#712E49] rounded-lg" onClick={handleLoadEmails}>Reload my emails</button>
        </div>
      </header>
      <Footer />
    </div>
  )

  const ReturningUser = () => (
    <div className="flex flex-col justify-between h-full">
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[59px] mb-0"
          alt="logo"
        />
        <h1 className="mt-[26px] text-[56px]">Hello, {name}</h1>
        <p className="text-[15px]">You&#39;re ready to shop!</p>
        <a href="https://www.efitterapp.com/brand-directory"
          className="mt-[29px] text-[#712E49] underline"
          target="_blank" rel="noreferrer">Browse our brand directory</a>
        <button className="mt-[28px] py-3 px-10 text-[#712E49] bg-[#FFD9E3] rounded-lg" onClick={handleLoadEmails}>Load more emails</button>
      </header>
      <Footer />
    </div>
  )

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-[600px] w-[572px] bg-white">
      {screen === 'signIn' && <SignIn />}
      {screen === 'firstTimeUser' && <FirstTimeUser />}
      {screen === 'loadingEmails' && <LoadingEmails />}
      {screen === 'startShopping' && <StartShopping />}
      {/* {screen === 'returningUser' && <ReturningUser />} */}
      <ToastContainer />
    </div>
  );
}
