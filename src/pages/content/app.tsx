/* eslint-disable react/no-unescaped-entities */
import { useCallback, useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const App = () => {
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
        <div className="fixed bottom-3 right-3">
          <button onClick={() => setOpen(true)}>
            <div className="h-10 w-10 transition-all hover:h-11 hover:w-11">
              <svg
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 492.15 492.71"
              >
                <path
                  d="m0,246.81c.21-67.19,23.45-125.03,70.63-173.1C118.8,24.63,177.78.05,246.07,0c67.16-.05,125.59,23.97,173.29,71.64,50.92,50.9,74.85,112.88,72.65,184.87-3.77,123.92-109.09,241.55-257.31,236.01C110.09,487.85-1.14,382.75,0,246.81Zm211.56,38.29c1.69-.84,2.86-1.46,4.06-2.02,28.69-13.2,57.38-26.39,86.07-39.6,23.71-10.91,47.4-21.84,71.11-32.74,2.09-.96,4.4-1.38,3.09-4.84-5.47-14.5-11.35-28.76-20.41-41.49-23.56-33.1-55.55-51.23-96.21-52.17-32.83-.76-63.03,9.07-90.21,27.45-52.08,35.22-75.97,98.82-48.16,160.3,25.13,55.57,76.69,81.26,133.88,74.2,30.56-3.77,58.39-15.45,83.87-32.56,22.81-15.32,40.29-35.09,49.54-61.46.92-2.62,1.22-4.04-1.91-5.23-18.63-7.11-37.21-14.36-55.74-21.71-2.47-.98-3.46-.42-4.59,1.8-2.09,4.15-4.25,8.31-6.87,12.14-14.39,21.1-35.18,32.35-59.72,36.1-18.49,2.83-34.75-3.21-47.79-18.17Z"
                  style={{ fill: "#fed8e2", strokeWidth: "0px" }}
                />
                <path
                  d="m211.57,285.1c13.05,14.96,29.3,21,47.79,18.17,24.55-3.76,45.33-15.01,59.72-36.1,2.61-3.83,4.78-7.99,6.87-12.14,1.12-2.23,2.12-2.78,4.59-1.8,18.54,7.35,37.11,14.6,55.74,21.71,3.13,1.19,2.83,2.61,1.91,5.23-9.25,26.37-26.74,46.14-49.54,61.46-25.48,17.11-53.31,28.79-83.87,32.56-57.19,7.06-108.74-18.64-133.88-74.2-27.81-61.47-3.92-125.08,48.16-160.3,27.18-18.38,57.38-28.22,90.21-27.45,40.66.94,72.65,19.07,96.21,52.17,9.06,12.73,14.94,27,20.41,41.49,1.31,3.46-1,3.88-3.09,4.84-23.71,10.91-47.4,21.83-71.11,32.74-28.69,13.2-57.38,26.39-86.07,39.6-1.2.55-2.37,1.17-4.06,2.02Zm-22.56-55.71c-.27,3.3.6,7.05,1.02,10.84.34,3.06,1.37,3.07,3.76,1.97,28.96-13.4,57.93-26.76,86.95-40.02,2.96-1.35,2.72-2.44.89-4.62-12.87-15.35-29-22.97-48.99-18.83-24.63,5.1-44.31,23.96-43.63,50.66Z"
                  style={{ fill: "#712e49", strokeWidth: "0px" }}
                />
                <path
                  d="m189.02,229.39c-.69-26.7,19-45.57,43.63-50.66,19.99-4.14,36.12,3.48,48.99,18.83,1.82,2.18,2.07,3.27-.89,4.62-29.02,13.26-57.99,26.63-86.95,40.02-2.39,1.1-3.42,1.09-3.76-1.97-.42-3.8-1.29-7.54-1.02-10.84Z"
                  style={{
                    fill: "#fed8e2",
                    strokeWidth: "0px",
                  }}
                />
              </svg>
            </div>
          </button>
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
                <Dialog.Panel className="fixed bottom-3 right-3 transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:w-full sm:max-w-[400px] sm:p-6 h-[96vh] max-h-[700px]">
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
