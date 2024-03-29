import React, { useRef, useState, useEffect } from "react";
import "./landing_page.css";
import { getShortenedURL } from "../../lib";
import NavBar from "../../general/navbar/navbar";
import CircularSpinner from "../../general/circular-spinner/circular-spinner";
import { isLoggedIn } from "../../general/utils/utils";

import * as errorMessages from "../../general/utils/error_messages";

function LandingPage() {
  isLoggedIn().then((data) => console.log(data));
  const [url, setUrl] = useState("");
  const [urlObjects, setUrlObjects] = useState([]);
  const urlContainer = useRef(false);
  const [copied, setCopied] = useState(-1);
  const timeoutId = useRef(null);
  const [isSqueezing, setIsSqueezing] = useState(false);

  useEffect(() => {
    let ele = document.getElementById("landing-page__url-input");
    ele.focus();
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  function handleCopyToClipboard(item, itemidx) {
    navigator.clipboard
      .writeText(item.shortened)
      .then(() => {
        setCopied(itemidx);
        timeoutId.current = setTimeout(() => {
          setCopied(-1);
        }, 3000);
      })
      .catch((error) => console.error(error));
  }

  function getPathFromURLString(url) {
    const parser = document.createElement("a");
    parser.href = url;
    return parser.pathname;
  }

  function handleAnalyse(item, idx) {
    let goToLink = document.createElement("a");
    goToLink.href = "/analyse" + getPathFromURLString(item.shortened);
    goToLink.click();
  }

  function handleClientError() {
    errorMessages.displayClientErrorMessage();
  }

  function handleServerError() {
    errorMessages.displayServerErrorMessage();
  }

  function handleInValidResponse() {
    console.log("invalid response");
    alert("This url doesn't exist anymore");
  }

  function handleValidResponse(data) {
    urlContainer.current = true;
    setUrlObjects((prev) => [...prev, { url: url, shortened: data.shortUrl }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    e.target.urlSubmitButton.disabled = true;
    setIsSqueezing(true);
    let match = false;
    for (let index in urlObjects) {
      let element = urlObjects[index];
      if (url === element.url) {
        const sleep = (delay) =>
          new Promise((resolve) => setTimeout(resolve, delay));
        await sleep(1000);
        setUrlObjects((prev) => [
          ...prev.filter((item) => {
            return item.url !== element.url;
          }),
        ]);
        setUrlObjects((prev) => [...prev, element]);
        match = true;
        break;
      }
    }
    if (!match) {
      let response = await getShortenedURL({ url: url });
      if (response.error) {
        handleClientError();
      } else if (!response.data.shortUrl) {
        if (response.data.serverError) {
          handleServerError();
        } else if (response.data.valid === false) {
          handleInValidResponse();
        }
      } else {
        handleValidResponse(response.data);
      }
    }
    setIsSqueezing(false);
    e.target.urlSubmitButton.disabled = false;
  }
  return (
    <div id="LandingPage">
      <NavBar />
      <form
        className="landing-page__url-container"
        onSubmit={(e) => handleSubmit(e)}
      >
        <input
          id="landing-page__url-input"
          className="landing-page__url-input"
          type="url"
          placeholder="Enter your URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoComplete="off"
          required
        />
        <button
          className="landing-page__submit-button"
          name="urlSubmitButton"
          type="submit"
        >
          {isSqueezing ? (
            <CircularSpinner
              size="20px"
              thickness="3px"
              color="blue"
              bgColor="rgb(3, 170, 31)"
            />
          ) : (
            "Squeeze"
          )}
        </button>
      </form>
      <div className="data">
        {urlContainer.current ? (
          <div className="data-url">
            <div className="long-url">URL</div>
            <div className="short-url">Short URL</div>
          </div>
        ) : null}
        {urlContainer.current &&
          [...urlObjects].reverse().map((item, idx) => (
            <div className="data-url" key={idx}>
              <div className="long-url">
                <a href={item.url}>{item.url}</a>
              </div>
              <div className="short-url">
                <a href={item.shortened} target="_blank" rel="noreferrer">
                  {item.shortened.split("/").slice(-1)}
                </a>
              </div>
              <div className="copy-button-holder">
                <button
                  className="copy-button"
                  onClick={() => handleCopyToClipboard(item, idx)}
                >
                  <i
                    className="material-icons"
                    style={copied === idx ? { color: "green" } : null}
                  >
                    content_copy
                  </i>
                </button>
                {copied === idx ? <span>Copied!</span> : null}
              </div>
              <button
                className="analysis-button"
                onClick={() => handleAnalyse(item, idx)}
              >
                <i className="material-icons">insert_chart</i>
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default LandingPage;
