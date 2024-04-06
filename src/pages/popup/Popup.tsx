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
import { Product } from "utils/calculateSize";

const screens = ['signIn', 'firstTimeUser', 'loadingEmails', 'startShopping', 'returningUser'] as const;
type Screen = typeof screens[number];
export default function Popup(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('signIn');
  const [name, setName] = useState<string>();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);
  const [productsFound, setProductsFound] = useState<number>(0);

  const calledOnce = useRef(false);

  const listeners = async (request, sender, sendResponse) => {
    let div;
    let body;
    let itemsIndex;
    let orderIndex;
    let startIndex;

    switch (request.context) {
      case config.keys.productsSaved:
        console.log('blah');
        setProductsFound(request.data.data);
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
                setScreen('returningUser');
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
      ).then((messages): void => {
        console.log('yolo in the background?', messages);
        if (isFirstTimeUser) {
          setProductsFound(0);
          setScreen('startShopping')
        } else {
          setProductsFound(0);
          setScreen('returningUser')
        }
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
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[59px] mb-0"
          alt="logo"
        />
        <h1 className="mt-[26px] text-[56px]">Hello, {name}</h1>
        <p className="text-[15px]">efitter uses your past orders to predict your size.<br />
          To get started, click “load your emails”</p>
        <button className="mt-[76px] py-3 px-10 text-[#712E49] bg-[#FFD9E3] rounded-lg" onClick={handleLoadEmails}>Load your email</button>
        <a className="py-3 mt-6 px-[30px] border text-[#712E49] border-[#712E49] rounded-lg" href="https://www.efitterapp.com/how-it-works"
          target="_blank" rel="noreferrer">How it works</a>
        <button className="mt-[76px] text-[#712E49] underline" onClick={handleLogout}>Log out</button>
      </header>
    </>
  )

  const LoadingEmails = () => {
    return (
      <>
        <header className="flex flex-col items-center justify-center text-black">
          <img
            src={logo}
            className="h-[56px] pointer-events-none mt-[59px] mb-0"
            alt="logo"
          />
          <h1 className="mt-[26px] text-[56px]">Hello, {name}</h1>
          <p className="text-[15px]">Give us a sec, searching for items...</p>
          <img
            src={loader}
            className="h-[114px] my-10 pointer-events-none"
            alt="logo"
          />
          {productsFound > 0 && <p className="text-[15px]">{productsFound}</p>}
          <a href="https://www.efitterapp.com/how-it-works"
            className="py-3 px-10 text-[#712E49] bg-[#FFD9E3] rounded-lg"
            target="_blank" rel="noreferrer">How it works</a>
          <button className="mt-[50px] text-[#712E49] underline" onClick={handleLogout}>Log out</button>
        </header>
      </>
    )
  }

  const StartShopping = () => (
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[59px] mb-0"
          alt="logo"
        />
        <h1 className="mt-[26px] text-[56px]">Hello, {name}</h1>
        <p className="text-[15px]">Now you&#39;re ready to shop!</p>
        <p className="mt-[5px] text-[15px]">Start shopping at your favorite brands including</p>
        <div className="flex items-center mt-[44px] gap-8">
          <a href="https://www.houseofcb.com/" target="_blank" rel="noreferrer"><img className="w-[121px] h-[35px]" src={houseOfCb} /></a>
          <a href="https://www.zara.com/uk/" target="_blank" rel="noreferrer"><img className="w-[86px] h-[32px]" src={zara} /></a>
          <a
            href="https://www.asos.com/women/a-to-z-of-brands/asos-collection/cat/?cid=4877&nlid=ww|brands|top+brands|asos+brands"
            target="_blank" rel="noreferrer"
          ><img className="9-[35px] h-[38px]" src={asos} /></a>
        </div>
        <a href="https://www.efitterapp.com/brand-directory"
          className="mt-[29px] text-[#712E49] underline"
          target="_blank" rel="noreferrer">Browse our brand directory</a>
        <button className="mt-[28px] py-3 px-10 text-[#712E49] bg-[#FFD9E3] rounded-lg" onClick={handleLoadEmails}>Load more emails</button>
        <a href="https://www.efitterapp.com/how-it-works"
          className="py-3 mt-6 px-[30px] border text-[#712E49] border-[#712E49] rounded-lg"
          target="_blank" rel="noreferrer">How it works</a>
        <button className="mt-[20px] text-[#712E49] underline" onClick={handleLogout}>Log out</button>
      </header>
    </>
  )

  const ReturningUser = () => (
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[59px] mb-0"
          alt="logo"
        />
        <h1 className="mt-[26px] text-[56px]">Hello, {name}</h1>
        <p className="text-[15px]">You&#39;re ready to shop!</p>
        <p className="mt-[5px] text-[15px]">Click any of the brands below to start shopping</p>
        <div className="flex items-center mt-[44px] gap-8">
          <a href="https://www.houseofcb.com/" target="_blank" rel="noreferrer"><img className="w-[121px] h-[35px]" src={houseOfCb} /></a>
          <a href="https://www.zara.com/uk/" target="_blank" rel="noreferrer"><img className="w-[86px] h-[32px]" src={zara} /></a>
          <a
            href="https://www.asos.com/women/a-to-z-of-brands/asos-collection/cat/?cid=4877&nlid=ww|brands|top+brands|asos+brands"
            target="_blank" rel="noreferrer"
          ><img className="9-[35px] h-[38px]" src={asos} /></a>
        </div>
        <a href="https://www.efitterapp.com/brand-directory"
          className="mt-[29px] text-[#712E49] underline"
          target="_blank" rel="noreferrer">Browse our brand directory</a>
        <button className="mt-[28px] py-3 px-10 text-[#712E49] bg-[#FFD9E3] rounded-lg" onClick={handleLoadEmails}>Load more emails</button>
        <a href="https://www.efitterapp.com/how-it-works"
          className="py-3 mt-6 px-[30px] border text-[#712E49] border-[#712E49] rounded-lg"
          target="_blank" rel="noreferrer">How it works</a>
        <button className="mt-[20px] text-[#712E49] underline" onClick={handleLogout}>Log out</button>
      </header>
    </>
  )

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-[600px] w-[572px] bg-white">
      {screen === 'signIn' && <SignIn />}
      {screen === 'firstTimeUser' && <FirstTimeUser />}
      {screen === 'loadingEmails' && <LoadingEmails />}
      {screen === 'startShopping' && <StartShopping />}
      {screen === 'returningUser' && <ReturningUser />}
    </div>
  );
}
