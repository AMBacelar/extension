/* eslint-disable react/no-unescaped-entities */
import { useCallback, useEffect, useState } from "react";
import { useQuery, QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Bot } from "../../../utils/bot";
import { LegalSize } from "../../../utils/size";
import { InstructionsResponse } from "../../../utils/instructions";
import { forSeconds } from "../../../utils/misc";
import { checkPage, loadUserData } from "./executeInstructions";

let efitterBot;

const App = () => {
  const [open, setOpen] = useState(false);
  const { data: instructions, error, isLoading } = useQuery<InstructionsResponse>({
    queryKey: ['getInstructions', window.location.hostname],
    queryFn: async () => {
      const response = await fetch("https://efitter-serverless.vercel.app/api", {
        method: "POST",
        body: JSON.stringify({ url: window.location.hostname }),
      });
      const { instructions } = await response.json();
      return instructions;
    }
  });

  useEffect(() => {
    console.log('run it all again!');
  }, [window.location.href]);

  useEffect(() => {
    if (instructions) {
      console.log(instructions)
      checkPage(instructions.toCheckPage)
        .then(res => {
          if (res) {
            loadUserData(instructions.toLoadUserData, instructions.brand)
              .then(res => {
                console.log('done', res);
                handlePageParse(res.current_size, res.material, res.efitter_products, res.efitter_email);
              })
              .catch(err => {
                console.log('oops', err);
              });
          }
        })
        .catch(err => console.log('2', err))
    }
  }, [instructions]);

  const setupEfitterBot = useCallback(async (current_size: LegalSize, material: string, products_length: number, user_email: string,) => {
    let attemptsRemaining = 10;
    try {
      efitterBot = new Bot(
        current_size,
        material,
        products_length,
        user_email
      );
      await forSeconds(1);
      console.log('$$$ just checking', efitterBot);
      await efitterBot.init();
      setOpen(true);
    } catch (ex) {
      console.log(ex + '!!!!');
      if (attemptsRemaining > 0) {
        attemptsRemaining--;
        setTimeout(() => setupEfitterBot(
          current_size,
          material,
          products_length,
          user_email
        ), 500);
      }

    }
  }, []);

  const handlePageParse = useCallback(async (current_size: LegalSize, material: string, efitter_products: any[], efitter_email: string) => {
    const today = new Date();
    const products = efitter_products.filter(
      (x: { date: string | number | Date; }) => Math.abs(today.getTime() - new Date(x.date).getTime()) / (1000 * 3600 * 24) / 30 <= 12
    );
    setupEfitterBot(current_size, material, products.length, efitter_email);
  }, []);

  if (!instructions || (instructions.brand as string) === '') {
    console.log('not yet')
    return null;
  }

  return (
    <>
      <div id="efitter-chatbot" className={`efitter-wrapper ${open ? 'efitter-main-card' : 'efitter-collapsed'}`}>
        <button id="efitter-chatbot_toggle" onClick={() => setOpen(val => !val)}>
          <div style={{ display: open ? "none" : "" }} className="efitter-untoggled-button pulse">
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
          <div style={{ display: open ? "" : "none" }} className="efitter-toggled-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#000000"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              />
            </svg>
          </div>
        </button>
        <div
          className="efitter-chat-area"
          id="efitter-message-box"
          style={{ display: open ? "flex" : "none" }}
        >
          <div id="efitter-chat-container" className="chatbox">
            <div id="efitter-chat-inner" className="message">
              <div id="efitter-chat"></div>
            </div>
          </div>
        </div>
      </div></>
  );
};

const withWrapper = () => {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

export default withWrapper;
