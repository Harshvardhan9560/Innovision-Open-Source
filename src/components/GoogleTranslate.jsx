import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    if (!document.querySelector("#google-translate-script")) {
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.async = true;
      document.body.appendChild(addScript);
    }

    window.googleTranslateElementInit = () => {
      if (!document.querySelector(".goog-te-combo")) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en" },
          "google_translate_element"
        );
      }
    };
  }, []);

  return <div id="google_translate_element"></div>;
};

export default GoogleTranslate;