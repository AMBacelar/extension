/* eslint-disable react/no-unescaped-entities */
import { useCallback, useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import logo from "./icon.svg";

const App = () => {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState<{ brand: string }>();

  const fetchInstructions = useCallback(async () => {
    const output = await fetch("https://efitter-serverless.vercel.app/api", {
      method: "POST",
      body: JSON.stringify({ url: window.location.hostname }),
    });
    const { instructions } = await output.json();
    console.log(instructions);
    setInstructions(instructions);
  }, []);

  useEffect(() => {
    fetchInstructions().catch(console.error);
  }, [fetchInstructions]);

  return (
    <>
      {!open && (
        <div className="fixed bottom-3 right-2 text-lg text-black bg-amber-400 z-50">
          content script loaded
          <p>count: {count}</p>
          <button onClick={() => setCount(count + 1)}>click me</button>
          <button onClick={() => setOpen(true)}>open</button>
          <img
            src={chrome.runtime.getURL(logo)}
            alt="logo"
            className="h-20 w-20"
          />
        </div>
      )}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="fixed bottom-3 right-3 transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:w-full sm:max-w-[400px] sm:p-6 h-full sm:max-h-[700px]">
                  <div className="flex-1 justify-between flex flex-col">
                    <div
                      id="messages"
                      className="flex flex-col space-y-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                    >
                      <div className="chat-message">
                        <div className="flex items-end">
                          <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                            <div>
                              <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">
                                Can be verified on any platform using docker
                              </span>
                            </div>
                          </div>
                          <img
                            src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                            alt="My profile"
                            className="w-6 h-6 rounded-full order-1"
                          />
                        </div>
                      </div>
                      <div className="chat-message">
                        <div className="flex items-end justify-end">
                          <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                            <div>
                              <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white ">
                                Your error message says permission denied, npm
                                global installs must be given root privileges.
                              </span>
                            </div>
                          </div>
                          <img
                            src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                            alt="My profile"
                            className="w-6 h-6 rounded-full order-2"
                          />
                        </div>
                      </div>
                      <div className="chat-message">
                        <div className="flex items-end">
                          <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                            <div>
                              <span className="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">
                                Command was run with root privileges. I'm sure
                                about that.
                              </span>
                            </div>
                            <div>
                              <span className="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">
                                I've update the description so it's more
                                obviously now
                              </span>
                            </div>
                            <div>
                              <span className="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600">
                                FYI https://askubuntu.com/a/700266/510172
                              </span>
                            </div>
                            <div>
                              <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">
                                Check the line above (it ends with a # so, I'm
                                running it as root )
                                <pre># npm install -g @vue/devtools</pre>
                              </span>
                            </div>
                          </div>
                          <img
                            src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                            alt="My profile"
                            className="w-6 h-6 rounded-full order-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default App;
