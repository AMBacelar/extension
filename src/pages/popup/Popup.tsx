import { useEffect, useState } from "react";
import logo from "@assets/img/logo.svg";
import loader from "@assets/img/loading.gif";
import mango from "@assets/img/mango.png";
import zara from "@assets/img/zara.png";
import asos from "@assets/img/asos.png";
import houseOfCb from "@assets/img/house_of_cb.png";
import { OAUTH } from "../../../utils/oauth";
import { storageGet } from "../../../utils/misc";
import { config } from "../../../utils/config";

const screens = ['signIn', 'firstTimeUser', 'loadingEmails', 'startShopping', 'returningUser'] as const;
type Screen = typeof screens[number];
export default function Popup(): JSX.Element {
  const [screen, setScreen] = useState<Screen>();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);

  useEffect(() => {
    storageGet(OAUTH.user.info)
      .then((user) => {
        console.log(user)
        if (user) {
          storageGet(config.keys.products)
            .then((products) => {
              console.log(products)
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

  }, [])


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
    const messages = await OAUTH.request.getMessages();
    console.log(messages);
    setScreen('loadingEmails');
  }

  const SignIn = () => (
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none"
          alt="logo"
        />
        <h1>Hello!</h1>
        <p>Let&#39;s get started</p>
        <button onClick={handleLogin}>Google</button>
        <p>Now Available at</p>
        <div className="flex items-center gap-8">
          <img className="w-[85px] h-[14px]" src={mango} />
          <img className="w-[49px] h-[19px]" src={zara} />
          <img className="w-[97px] h-[27px]" src={houseOfCb} />
        </div>
        <a href="">Browse our brand directory</a>
      </header>
    </>)

  const FirstTimeUser = () => (
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none"
          alt="logo"
        />
        <h1>Hello, NAME</h1>
        <p>efitter uses your past orders to predict your size.<br />
          To get started, click “load your emails”</p>
        <button onClick={handleLoadEmails}>Load your email</button>
        <a href="https://www.efitterapp.com/how-it-works"
          target="_blank" rel="noreferrer">How it works</a>
        <button onClick={handleLogout}>Log out</button>
      </header>
    </>
  )

  const LoadingEmails = () => {
    useEffect(() => {
      setTimeout(() => {
        if (isFirstTimeUser) {
          setScreen('startShopping')
        } else {
          setScreen('returningUser')
        }
      }, 1000);
    }, [])

    return (
      <>
        <header className="flex flex-col items-center justify-center text-black">
          <img
            src={logo}
            className="h-[56px] pointer-events-none"
            alt="logo"
          />
          <h1>Hello, NAME</h1>
          <p>Give us a sec, searching for items...</p>
          <img
            src={loader}
            className="h-[114px] pointer-events-none"
            alt="logo"
          />
          <p>email count</p>
          <a href="https://www.efitterapp.com/how-it-works"
            target="_blank" rel="noreferrer">How it works</a>
          <button onClick={handleLogout}>Log out</button>
        </header>
      </>
    )
  }

  const StartShopping = () => (
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none"
          alt="logo"
        />
        <h1>Hello, NAME</h1>
        <p>Now you&#39;re ready to shop!<br />
          Start shopping at your favorite brands including</p>
        <div className="flex items-center gap-8">
          <a href="https://www.houseofcb.com/" target="_blank" rel="noreferrer"><img className="w-[121px] h-[35px]" src={houseOfCb} /></a>
          <a href="https://www.zara.com/uk/" target="_blank" rel="noreferrer"><img className="w-[86px] h-[32px]" src={zara} /></a>
          <a
            href="https://www.asos.com/women/a-to-z-of-brands/asos-collection/cat/?cid=4877&nlid=ww|brands|top+brands|asos+brands"
            target="_blank" rel="noreferrer"
          ><img className="9-[35px] h-[38px]" src={asos} /></a>
        </div>
        <a href="https://www.efitterapp.com/brand-directory"
          target="_blank" rel="noreferrer">Browse our brand directory</a>
        <button onClick={handleLoadEmails}>Load more emails</button>
        <a href="https://www.efitterapp.com/how-it-works"
          target="_blank" rel="noreferrer">How it works</a>
        <button onClick={handleLogout}>Log out</button>
      </header>
    </>
  )

  const ReturningUser = () => (
    <>
      <header className="flex flex-col items-center justify-center text-black">
        <img
          src={logo}
          className="h-[56px] pointer-events-none"
          alt="logo"
        />
        <h1>Hello, NAME</h1>
        <p>You&#39;re ready to shop!<br />
          Click any of the brands below to start shopping</p>
        <div className="flex items-center gap-8">
          <a href="https://www.houseofcb.com/" target="_blank" rel="noreferrer"><img className="w-[121px] h-[35px]" src={houseOfCb} /></a>
          <a href="https://www.zara.com/uk/" target="_blank" rel="noreferrer"><img className="w-[86px] h-[32px]" src={zara} /></a>
          <a
            href="https://www.asos.com/women/a-to-z-of-brands/asos-collection/cat/?cid=4877&nlid=ww|brands|top+brands|asos+brands"
            target="_blank" rel="noreferrer"
          ><img className="9-[35px] h-[38px]" src={asos} /></a>
        </div>
        <a href="https://www.efitterapp.com/brand-directory"
          target="_blank" rel="noreferrer">Browse our brand directory</a>
        <button onClick={handleLoadEmails}>Load more emails</button>
        <a href="https://www.efitterapp.com/how-it-works"
          target="_blank" rel="noreferrer">How it works</a>
        <button onClick={handleLogout}>Log out</button>
      </header>
    </>
  )

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-[600px] w-[572px] p-3 bg-white">
      {screen === 'signIn' && <SignIn />}
      {screen === 'firstTimeUser' && <FirstTimeUser />}
      {screen === 'loadingEmails' && <LoadingEmails />}
      {screen === 'startShopping' && <StartShopping />}
      {screen === 'returningUser' && <ReturningUser />}
    </div>
  );
}
