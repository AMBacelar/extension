import { SetStateAction, useEffect, useRef, useState } from "react";
import logo from "@assets/img/logo.svg";
import googleSigninButton from "@assets/img/google-signin-button.png";
import googlePermission from "@assets/img/google-permission.png";
import { OAUTH } from "../../../utils/oauth";
import { ExtensionMessage, requestBackground, storageGet, storageSet } from "../../../utils/misc";
import { config } from "../../../utils/config";
import { Product } from "../../../utils/calculateSize";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast-overrides.css';
import { useStateWithCallback } from "../../../utils/use-state-with-callback";

const screens = ['welcomeScreen', 'permissionsPage', 'signIn', 'firstTimeUser', 'loadingEmails', 'startShopping'] as const;
type Screen = typeof screens[number];
const onboardingTimeoutDuration = 3000;

type ProfileInfo = {
  email: string;
  family_name: string;
  given_name: string;
  hd: string;
  id: string;
  locale: string;
  name: string;
  picture: string;
  verified_email: boolean
}

export default function Popup(): JSX.Element {
  const [screen, setScreen] = useState<Screen>();
  const [name, setName] = useState<string>();
  const [, setIsFirstTimeUser] = useState<boolean>(true);
  const [productsFound, setProductsFound] = useStateWithCallback<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [messagesProcessed, setMessagesProcessed] = useState<number>(0);
  const [onboardingTimeout, setOnboardingTimeout] = useStateWithCallback(setTimeout(() => {/* no-op */ }, 1));
  const [isOnboardingButtonClicked, setIsOnboardingButtonClicked] = useState<boolean>(false);

  const calledOnce = useRef(false);

  const listeners = async (request: { context: any; data: { data: SetStateAction<number>; }; payload: any; }, _sender: unknown, sendResponse: (arg0: string | string[] | null) => void) => {
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
    storageGet<ProfileInfo>(config.keys.user)
      .then((user) => {
        if (user) {
          console.log('uouo', user);
          setName(user.given_name);
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
          setScreen('welcomeScreen');
        }
      })
      .catch(() => {
        setScreen('welcomeScreen');
      })

    chrome.runtime.onMessage.addListener(listeners);

    calledOnce.current = true;

    return () => {
      chrome.runtime.onMessage.removeListener(listeners);
    }
  }, []);

  useEffect(() => {
    clearTimeout(onboardingTimeout);
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

    if ((screen === 'welcomeScreen' || screen === 'permissionsPage')) {
      setOnboardingTimeout(setTimeout(() => {
        if (!isOnboardingButtonClicked) {
          const targetScreen = screens[(screens.indexOf(screen)) + 1];
          setScreen(targetScreen);
        }
      }, onboardingTimeoutDuration), (prev) => {
        clearTimeout(prev)
      });
    }
  }, [screen]);

  const handleLogin = async () => {
    requestBackground<ProfileInfo>(
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
      .catch(err => console.log('hmm error', err))


    await OAUTH.user.signIn();
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
  }

  const handleLogout = async () => {
    await storageSet(config.keys.user, null);
    await storageSet(
      config.keys.googleUserId,
      null
    );
    requestBackground<ProfileInfo>(
      new ExtensionMessage('logout')
    )
    console.log('logged out?');
    setScreen('welcomeScreen');
  }

  const handleLoadEmails = async () => {
    setScreen('loadingEmails');
  }

  const Footer = () => (
    <div className="h-[90px] py-7 px-8 flex items-center border-t-2 justify-between">
      <a className="py-3 px-[30px] border-2 text-[#712E49] border-[#712E49] rounded-lg text-[14px]" href="https://www.efitterapp.com/how-it-works"
        target="_blank" rel="noreferrer">How it works</a>
      <button className="text-[#712E49] underline text-[14px]" onClick={handleLogout}>Log out</button>
    </div>
  )


  const Dots = () => {
    const dots = [
      { screen: screens[0], onClick: () => { setIsOnboardingButtonClicked(true); setScreen(screens[0]) } },
      { screen: screens[1], onClick: () => { setIsOnboardingButtonClicked(true); setScreen(screens[1]) } },
      { screen: screens[2], onClick: () => { setIsOnboardingButtonClicked(true); setScreen(screens[2]) } },
    ];

    const Dot = ({ target, onClick }: { target: string; onClick: () => void }) => {
      const colour = target === screen ? '#712E49' : '#C7A7B4';
      return (
        <div onClick={onClick} style={{ backgroundColor: colour }} className={`w-[18px] h-[18px] rounded-full cursor-pointer`}></div>
      )
    }

    return (
      <div className="w-[100%] h-[80px] flex gap-1 justify-center items-center">
        {dots.map(({ screen, onClick }) => (
          <Dot key={screen} onClick={onClick} target={screen} />
        ))
        }
      </div>
    )
  }

  const Welcome = () => (
    <div className="flex flex-col justify-between h-full">
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[70px] mb-0"
          alt="logo"
        />
        <h1 className=" tracking-wide mt-[90px] text-[85px] leading-none">Let&#39;s get<br />started</h1>
      </header>
      <Dots />
    </div>)

  const Permissions = () => (
    <div className="flex flex-col justify-between h-full">
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[70px] mb-0"
          alt="logo"
        />
        <h1 className=" tracking-wide mt-[32px] text-[56px] leading-none">We need your<br />permission</h1>
        <p className="mt-[39px]">Once you sign in, tick the option below to allow us to search<br />your order confirmation emails from fashion retailers.</p>
        <p className="mt-[8px] text-[16px] font-bold">efitter will not function unless you select this option.</p>
        <img
          src={googlePermission}
          className="w-[344px] pointer-events-none mt-[27px] mb-0"
          alt="logo"
        />
      </header>
      <Dots />
    </div>)

  const SignIn = () => (
    <div className="flex flex-col justify-between h-full">
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[70px] mb-0"
          alt="logo"
        />
        <h1 className=" tracking-wide mt-[32px] text-[56px] leading-none">Sign in to start<br />shopping</h1>
        <button className="my-[50px]" onClick={handleLogin}>
          <img
            className="w-[187px] h-[44px]"
            src={googleSigninButton}
          />
        </button>
        <p className="">After you sign in and give us permission, remember<br />to load your emails so we can calculate your size.</p>
      </header>
      <Dots />
    </div>)

  const FirstTimeUser = () => (
    <div className="flex flex-col justify-between h-full">
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none mt-[59px] mb-0"
          alt="logo"
        />
        <h1 className=" tracking-wide mt-[56px] text-[56px]">Hey {name}</h1>
        <p className="text-[15px] my-[39px]">efitter uses your past orders to predict your size.<br />
          To get started, click “Load your emails”</p>
        <button className="py-3 px-10 text-[#712E49] bg-[#FFD9E3] rounded-lg" onClick={handleLoadEmails}>Load your emails</button>
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
          <h1 className=" tracking-wide mt-[50px] text-[56px] leading-none">We&apos;re loading<br />your emails</h1>
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
        <h1 className=" tracking-wide my-[39px] text-[56px]">Shop with efitter</h1>
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

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-[600px] w-[572px] bg-white">
      {screen === 'welcomeScreen' && <Welcome />}
      {screen === 'permissionsPage' && <Permissions />}
      {screen === 'signIn' && <SignIn />}
      {screen === 'firstTimeUser' && <FirstTimeUser />}
      {screen === 'loadingEmails' && <LoadingEmails />}
      {screen === 'startShopping' && <StartShopping />}
      {/* {screen === 'returningUser' && <ReturningUser />} */}
      <ToastContainer />
    </div>
  );
}
